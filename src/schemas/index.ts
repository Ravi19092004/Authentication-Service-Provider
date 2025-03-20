// src/schemas/index.ts
import { UserRole } from "@prisma/client";
import * as z from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

export const Settingschema = z.object({
    name: z.string().optional(),
    isTwoFactorEnabled: z.boolean().optional(),
    role: z.enum([UserRole.ADMIN, UserRole.USER]).optional(), // Made optional
    email: z.string().email().optional(),
    password: z.string().min(12).optional(),
    newPassword: z.string().min(12).optional(),
})
.refine((data) => {
    if (data.password && !data.newPassword) {
        return false;
    }
    return true;
}, {
    message: "New password is required when changing password!",
    path: ["newPassword"],
});

export const NewPasswordSchema = z.object({
    password: z.string().min(12, { message: "Password must be at least 12 characters and include uppercase and lowercase letters, numbers, and symbols." }),
});

export const ResetSchema = z.object({
    email: z.string().email({ message: "Email is required" }),
});

export const LoginSchema = z.object({
    email: z.string().email({ message: "Email is required" }),
    password: z.string().min(1, { message: "Password is required" }),
    code: z.string().optional(),
});

export const RegisterSchema = z.object({
    email: z.string().email({ message: "Email is required" }),
    password: z.string().refine(
        (val) => passwordRegex.test(val),
        {
            message: "Password must be at least 12 characters and include uppercase and lowercase letters, numbers, and symbols.",
        }
    ),
    name: z.string().min(1, { message: "Name is required" }),
});