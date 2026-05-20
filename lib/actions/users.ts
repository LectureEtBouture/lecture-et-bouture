'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, ne, count, and } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { sendResetPasswordEmail } from '@/services/resend';

const ADMIN_ROLES = ['super_admin', 'admin'] as const;
const ASSIGNABLE_BY_ADMIN = ['editor', 'moderator', 'contributor'] as const;

async function requireUserManager() {
    const session = await auth();
    if (!session) redirect('/admin/login');
    if (!ADMIN_ROLES.includes(session.user?.role as (typeof ADMIN_ROLES)[number])) {
        redirect('/admin');
    }
    return session;
}

function isSuperAdmin(role?: string | null) {
    return role === 'super_admin';
}

function canManageTarget(actorRole: string | undefined, targetRole: string) {
    if (actorRole === 'super_admin') return true;
    if (actorRole === 'admin') return targetRole !== 'super_admin';
    return false;
}

function canAssignRole(actorRole: string | undefined, targetRole: string) {
    if (actorRole === 'super_admin') return true;
    if (actorRole === 'admin') return ASSIGNABLE_BY_ADMIN.includes(targetRole as (typeof ASSIGNABLE_BY_ADMIN)[number]);
    return false;
}

export async function getUsers() {
    const session = await requireUserManager();
    const all = await db.select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
    }).from(users).orderBy(users.createdAt);

    if (isSuperAdmin(session.user?.role)) return all;
    return all.filter((user) => user.role !== 'super_admin');
}

export async function getUser(id: string) {
    return db.select().from(users).where(eq(users.id, id)).limit(1).then((r) => r[0] ?? null);
}

const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['super_admin', 'admin', 'editor', 'moderator', 'contributor']),
});

export async function createUser(formData: FormData) {
    const session = await requireUserManager();
    const parsed = createUserSchema.parse({
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
    });

    if (!canAssignRole(session.user?.role, parsed.role)) {
        throw new Error('Rôle non autorisé.');
    }

    const passwordHash = await argon2.hash(parsed.password);
    await db.insert(users).values({
        email: parsed.email,
        passwordHash,
        role: parsed.role,
    });

    revalidatePath('/admin/users');
    redirect('/admin/users');
}

const updateUserSchema = z.object({
    email: z.string().email(),
    role: z.enum(['super_admin', 'admin', 'editor', 'moderator', 'contributor']),
});

export async function updateUser(id: string, formData: FormData) {
    const session = await requireUserManager();
    const target = await getUser(id);
    if (!target) redirect('/admin/users');

    if (!canManageTarget(session.user?.role, target.role)) {
        throw new Error('Action non autorisée.');
    }

    const parsed = updateUserSchema.parse({
        email: formData.get('email'),
        role: formData.get('role'),
    });

    if (!canAssignRole(session.user?.role, parsed.role)) {
        throw new Error('Rôle non autorisé.');
    }

    await db.update(users).set({
        email: parsed.email,
        role: parsed.role,
        updatedAt: new Date(),
    }).where(eq(users.id, id));

    revalidatePath('/admin/users');
    redirect('/admin/users');
}

export async function deleteUser(id: string) {
    const session = await requireUserManager();
    const target = await getUser(id);
    if (!target) return;

    if (!canManageTarget(session.user?.role, target.role)) {
        throw new Error('Action non autorisée.');
    }

    if (isSuperAdmin(target.role)) {
        const [{ total }] = await db
            .select({ total: count() })
            .from(users)
            .where(eq(users.role, 'super_admin'));
        if (Number(total) <= 1) {
            throw new Error('Impossible de supprimer le dernier super_admin.');
        }
    }

    await db.delete(users).where(eq(users.id, id));
    revalidatePath('/admin/users');
}

// Admin-initiated reset
export async function initiatePasswordReset(id: string) {
    const session = await requireUserManager();
    const target = await getUser(id);
    if (!target) return;

    if (!canManageTarget(session.user?.role, target.role)) {
        throw new Error('Action non autorisée.');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.update(users).set({
        resetToken: token,
        resetTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
    }).where(eq(users.id, id));

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    await sendResetPasswordEmail({
        to: target.email,
        resetUrl: `${baseUrl}/admin/reset-password?token=${token}`,
    });

    revalidatePath('/admin/users');
}

// Self-service: forgot password
export async function forgotPassword(formData: FormData) {
    const email = z.string().email().safeParse(formData.get('email'));
    if (!email.success) return { error: 'Email invalide.' };

    const user = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.email, email.data))
        .limit(1)
        .then((r) => r[0]);

    // Ne pas révéler si l'email existe ou non
    if (!user) return { success: true };

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.update(users).set({
        resetToken: token,
        resetTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
    }).where(eq(users.id, user.id));

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    await sendResetPasswordEmail({
        to: user.email,
        resetUrl: `${baseUrl}/admin/reset-password?token=${token}`,
    });

    return { success: true };
}

const resetSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8),
});

export async function resetPassword(formData: FormData) {
    const parsed = resetSchema.safeParse({
        token: formData.get('token'),
        password: formData.get('password'),
    });
    if (!parsed.success) return { error: 'Données invalides.' };

    const user = await db
        .select({ id: users.id, resetTokenExpiresAt: users.resetTokenExpiresAt })
        .from(users)
        .where(and(
            eq(users.resetToken, parsed.data.token),
            ne(users.resetToken, ''),
        ))
        .limit(1)
        .then((r) => r[0]);

    if (!user) return { error: 'Lien invalide ou expiré.' };
    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
        return { error: 'Lien expiré. Faites une nouvelle demande.' };
    }

    const passwordHash = await argon2.hash(parsed.data.password);
    await db.update(users).set({
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
        updatedAt: new Date(),
    }).where(eq(users.id, user.id));

    return { success: true };
}
