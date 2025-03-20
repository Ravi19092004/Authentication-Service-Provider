"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "../schemas";
import * as z from "zod";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail"; 

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, name } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return { error: "User already exists!" };
    }

    const newUser = await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    // Verify that the password was set correctly
    if (!newUser.password) {
        console.error("Failed to set password for new user:", newUser.id);
        return { error: "Failed to create user: Password not set!" };
    }

    console.log("New user created:", { id: newUser.id, email: newUser.email });

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return { success: "Confirmation email sent!" };
};