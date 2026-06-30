'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { redirect } from 'next/navigation';
import argon2 from 'argon2';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sessionOptions, type SessionData } from '@/lib/session';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export async function login(_: unknown, formData: FormData) {
    const parsed = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!parsed.success) return { error: 'Email ou mot de passe incorrect.' };

    const { email, password } = parsed.data;

    const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
        .then((r) => r[0]);

    if (!user) return { error: 'Email ou mot de passe incorrect.' };

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) return { error: 'Email ou mot de passe incorrect.' };

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    session.userId = user.id;
    session.email = user.email;
    session.role = user.role;
    session.isLoggedIn = true;
    await session.save();

    redirect('/admin');
}

export async function logout() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    session.destroy();
    redirect('/admin/login');
}
