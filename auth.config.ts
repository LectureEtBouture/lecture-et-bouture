import type { NextAuthConfig } from 'next-auth';

// Edge-compatible config — no Node.js-only modules here
export const authConfig: NextAuthConfig = {
    trustHost: true,
    pages: {
        signIn: '/admin/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 8 * 60 * 60,
    },
    providers: [],
    callbacks: {
        authorized({ auth, request }) {
            const { pathname } = request.nextUrl;
            const publicAdminPaths = [
                '/admin/login',
                '/admin/forgot-password',
                '/admin/reset-password',
            ];
            if (
                pathname.startsWith('/admin') &&
                !publicAdminPaths.includes(pathname)
            ) {
                return !!auth;
            }
            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.role = user.role;
            }
            return token;
        },
        session({ session, token }) {
            session.user.id = token.sub ?? '';
            session.user.role = token.role as string | undefined;
            return session;
        },
    },
};
