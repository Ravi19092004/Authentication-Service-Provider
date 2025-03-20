"use server";

import { signIn } from "@/auth";
import { LoginSchema } from "@/src/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { generateTwoFactorToken } from "@/lib/tokens";
import { sendTwoFactorTokenEmail } from "@/lib/mail";
import { getUserByEmail } from "@/data/user";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Define the return type for the login action
type LoginResponse =
  | { error: string; success?: undefined; twoFactor?: undefined; redirect?: undefined }
  | { success: string; error?: undefined; twoFactor?: boolean; redirect?: undefined }
  | { success: string; redirect: string; error?: undefined; twoFactor?: undefined };

export const login = async (values: any): Promise<LoginResponse> => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  console.log("Login action - Values:", { email, password, code });

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" };
  }

  console.log("Login attempt:", {
    email,
    hasPassword: !!existingUser.password,
    emailVerified: existingUser.emailVerified,
    isTwoFactorEnabled: existingUser.isTwoFactorEnabled,
  });

  if (!existingUser.emailVerified) {
    return { error: "Email not verified!" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      console.log("Verifying 2FA code:", {
        providedCode: code,
        storedToken: twoFactorToken?.token,
        tokenExists: !!twoFactorToken,
      });

      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { error: "Invalid two-factor code!" };
      }

      if (new Date(twoFactorToken.expiresAt) < new Date()) {
        return { error: "Two-factor code has expired!" };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      console.log("2FA token deleted");

      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      const confirmation = await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });

      console.log("2FA verified and confirmation created for user:", existingUser.id, "Confirmation ID:", confirmation.id);
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      console.log("Generated 2FA token:", twoFactorToken);

      console.log("Sending 2FA email:", { email: existingUser.email, token: twoFactorToken.token });
      await sendTwoFactorTokenEmail(existingUser.email, twoFactorToken.token);
      console.log("2FA email sent successfully to:", existingUser.email);

      console.log("2FA token generated and emailed:", { email: existingUser.email, token: twoFactorToken.token });
      return { success: "Two-factor code sent to your email!", twoFactor: true };
    }
  }

  try {
    console.log("Calling signIn after 2FA verification for email:", email);
    const result = await signIn("credentials", {
      email,
      password: code ? undefined : password, // Only pass password if 2FA code is not provided
      redirect: false,
    });

    console.log("Sign-in result after 2FA:", result);

    if (result?.error) {
      return { error: "Invalid credentials!" };
    }

    // Delete the 2FA confirmation after successful sign-in
    if (existingUser.isTwoFactorEnabled) {
      const confirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
      if (confirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: confirmation.id },
        });
        console.log("2FA confirmation deleted after successful sign-in");
      }
    }

    revalidatePath(DEFAULT_LOGIN_REDIRECT);
    return { success: "Logged in successfully!", redirect: DEFAULT_LOGIN_REDIRECT };
  } catch (error) {
    console.log("Sign-in error after 2FA:", error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
};