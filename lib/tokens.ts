import { getVerificationTokenByEmail } from '../data/verification-tokens';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { db } from '../lib/db';
import { getPasswordResetTokenByEmail } from '../data/password-reset-token';
import { getTwoFactorTokenByEmail } from '../data/two-factor-token';

export const generateTwoFactorToken = async (email: string) => {
    const token = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(new Date().getTime() + 3600 * 1000);

    const existingToken = await getTwoFactorTokenByEmail(email);
    if (existingToken) {
        await db.twoFactorToken.delete({
            where: { id: existingToken.id }
        });
    }

    const twoFactorToken = await db.twoFactorToken.create({
        data: {
            token,
            email,
            expiresAt,
        }
    });
    console.log("Generated 2FA token:", { token, email, expiresAt }); // Add this
    return twoFactorToken;
};

export const generatePasswordResetToken = async (email: string) => {
    const token = uuidv4();
    const expiresAt = new Date(new Date().getTime() + 5 * 60 * 1000);

    const existingToken = await getPasswordResetTokenByEmail(email);
    if (existingToken) {
        await db.passwordResetToken.delete({
            where: { id: existingToken.id }
        });
    }

    const passwordResetToken = await db.passwordResetToken.create({
        data: {
            token,
            email,
            expiresAt,
        }
    });
    console.log("Generated password reset token:", { token, email, expiresAt }); // Add this
    return passwordResetToken;
};

export const generateVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expiresAt = new Date(new Date().getTime() + 3600 * 1000);

    const existingToken = await getVerificationTokenByEmail(email);
    if (existingToken) {
        await db.verificationToken.delete({
            where: { id: existingToken.id }
        });
        console.log("Deleted existing verification token for:", email); // Add this
    }

    const verificationToken = await db.verificationToken.create({
        data: {
            token,
            email,
            expiresAt,
        }
    });
    console.log("Generated verification token:", { id: verificationToken.id, token, email, expiresAt }); // Add this
    return verificationToken;
};