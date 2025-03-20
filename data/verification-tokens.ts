// data/verification-tokens.ts
import { db } from '@/lib/db';

export const getVerificationTokenByToken = async (token: string) => {
    try {
    const getVerificationToken = await db.verificationToken.findUnique({
      where: { token }
    });
    
    return getVerificationToken;
    } catch {
    return null;
    }
    }
export const getVerificationTokenByEmail = async (email: string) => {
try {
const getVerificationToken = await db.verificationToken.findFirst({
  where: { email }
});

return getVerificationToken;
} catch {
return null;
}
}