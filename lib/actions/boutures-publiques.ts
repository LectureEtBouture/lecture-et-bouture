'use server';

import { getBouturesPubliques } from '@/lib/queries/boutures';

const PAGE_SIZE = 10;

export async function loadMoreBoutures(offset: number) {
    return getBouturesPubliques({ limit: PAGE_SIZE, offset });
}
