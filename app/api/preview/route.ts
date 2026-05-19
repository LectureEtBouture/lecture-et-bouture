import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const secret = searchParams.get('secret');
    const slug = searchParams.get('slug');

    if (!secret || secret !== process.env.PREVIEW_SECRET) {
        return new Response('Token invalide', { status: 401 });
    }

    if (!slug) {
        return new Response('Paramètre slug manquant', { status: 400 });
    }

    (await draftMode()).enable();
    redirect(`/${slug}`);
}
