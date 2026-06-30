import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { logout } from '@/lib/actions/auth';
import { AdminShell } from './_components/AdminShell';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) redirect('/admin/login');

    return (
        <AdminShell
            email={session.user?.email ?? ''}
            role={session.user?.role}
            signOutAction={logout as () => Promise<void>}
            devEmail={process.env.DEVELOPPER_EMAIL}
        >
            {children}
        </AdminShell>
    );
}
