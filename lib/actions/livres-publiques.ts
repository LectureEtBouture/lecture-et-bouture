'use server';

import { getLivresPubliques, type LivresFilters } from '@/lib/queries/livres';

const PAGE_SIZE = 24;

export async function loadMoreLivres(filters: LivresFilters, offset: number) {
    return getLivresPubliques({ ...filters, limit: PAGE_SIZE, offset });
}
