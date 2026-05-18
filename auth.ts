import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { adminUsers } from '@/db/schema';
import argon2 from 'argon2';
import { z } from 'zod';
import { authConfig } from './auth.config';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) return null;

                const { email, password } = parsed.data;

                const user = await db
                    .select()
                    .from(adminUsers)
                    .where(eq(adminUsers.email, email))
                    .limit(1)
                    .then((r) => r[0]);

                if (!user) return null;

                const valid = await argon2.verify(user.passwordHash, password);
                if (!valid) return null;

                return { id: String(user.id), email: user.email };
            },
        }),
    ],
});
