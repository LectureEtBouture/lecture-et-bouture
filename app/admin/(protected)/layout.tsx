import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminShell } from './_components/AdminShell';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) redirect('/admin/login');

    const signOutAction = async () => {
        'use server';
        await signOut({ redirectTo: '/admin/login' });
    };

    return (
        <AdminShell
            email={session.user?.email ?? ''}
            role={session.user?.role}
            signOutAction={signOutAction}
        >
            {children}
        </AdminShell>
    );
}
