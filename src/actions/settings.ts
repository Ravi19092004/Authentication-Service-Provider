"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Settingschema } from "../schemas";
import { getUserByEmail, getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { generateVerificationToken } from "@/lib/tokens";
import { unstable_update } from "@/auth";
import { sendVerificationEmail } from "@/lib/mail";

export const settings = async (values: z.infer<typeof Settingschema>) => {
    try {
        // Get the current user
        const user = await currentUser();
        console.log("Current user in settings:", user);

        if (!user || !user.id) {
            return { error: "User not authorized!" };
        }

        // Validate form fields
        const validatedFields = Settingschema.safeParse(values);
        if (!validatedFields.success) {
            console.log("Validation errors:", validatedFields.error);
            return { error: "Invalid fields!" };
        }

        const { email, password, newPassword, name, role, isTwoFactorEnabled } = validatedFields.data;

        // Prevent OAuth users from changing restricted fields
        if (user.isOAuth) {
            if (password || newPassword || email || isTwoFactorEnabled !== undefined) {
                return { error: "OAuth users cannot modify email, password, or two-factor settings!" };
            }
        }

        // Fetch the user from the database
        const dbUser = await getUserById(user.id);
        if (!dbUser) {
            return { error: "User not found in database!" };
        }

        // Handle email change (only for email/password users)
        if (!user.isOAuth && email && email !== user.email) {
            const existingUser = await getUserByEmail(email);
            if (existingUser && existingUser.id !== user.id) {
                return { error: "Email already exists!" };
            }

            const verificationToken = await generateVerificationToken(email);
            await sendVerificationEmail(verificationToken.email, verificationToken.token);
            return { success: "Verification email sent!" };
        }

        // Handle password change (only for email/password users)
        let hashedPassword: string | undefined;
        if (!user.isOAuth && password && newPassword) {
            if (!dbUser.password) {
                console.log("No password set for user:", user.id);
                return { error: "No password set for this user! Please reset your password to set a new one." };
            }

            const passwordsMatch = await bcrypt.compare(password, dbUser.password);
            if (!passwordsMatch) {
                return { error: "Incorrect current password!" };
            }

            hashedPassword = await bcrypt.hash(newPassword, 10);
        }

        // Build the update data object with only defined fields
        const updateData: Partial<z.infer<typeof Settingschema>> = {};
        if (name !== undefined) updateData.name = name;
        if (role !== undefined) updateData.role = role;
        if (!user.isOAuth && isTwoFactorEnabled !== undefined) updateData.isTwoFactorEnabled = isTwoFactorEnabled;
        if (hashedPassword) updateData.password = hashedPassword;

        // Skip update if no fields have changed
        if (Object.keys(updateData).length === 0) {
            return { success: "No changes to update!" };
        }

        // Update user in the database
        const updatedUser = await db.user.update({
            where: { id: dbUser.id },
            data: updateData,
        });

        // Update the session with the new user data
        await unstable_update({
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
                role: updatedUser.role,
            },
        });

        return { success: "Settings updated!" };
    } catch (error) {
        console.error("Settings update failed:", error);
        return { error: "Failed to update settings" };
    }
};