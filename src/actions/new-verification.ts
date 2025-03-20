// src/actions/new-verification.ts
"use server";

import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-tokens";

export const newVerification = async (token: string) => {
  console.log("Verifying token:", token);
  const existingToken = await getVerificationTokenByToken(token);
  
  if (!existingToken) {
    console.log("Token not found in DB");
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expiresAt) < new Date();
  console.log("Token expiration check:", { expiresAt: existingToken.expiresAt, hasExpired });
  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);
  console.log("User lookup:", { email: existingToken.email, userFound: !!existingUser });
  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: { emailVerified: new Date(), email: existingToken.email },
  });
  console.log("Email verified for user:", existingUser.id);

  await db.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Email verified!" };
};