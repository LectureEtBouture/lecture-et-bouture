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
            const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
            const isLoginPage = request.nextUrl.pathname === '/admin/login';
            if (isAdminRoute && !isLoginPage) return !!auth;
            return true;
        },
    },
};
