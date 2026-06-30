import type { SessionOptions } from 'iron-session';

export interface SessionData {
    userId: string;
    email: string;
    role: string;
    isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
    password: process.env.NEXTAUTH_SECRET!,
    cookieName: 'leb-session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
    },
};
