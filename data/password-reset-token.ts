import { db } from "@/lib/db";

export const getPasswordResetTokenByToken = async (token: string) => {
    try {
        const getPasswordResetToken = await db.passwordResetToken.findUnique({
            where: { token },
        });

        return getPasswordResetToken;
    } catch {
        return null;
    }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
    try {
        const getPasswordResetToken = await db.passwordResetToken.findFirst({
            where: { email },
        });

        return getPasswordResetToken;
    } catch {
        return null;
    }
};