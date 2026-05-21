'use server';

import {
    getLivresPubliques,
    getLivresTendances,
    getLivresNouveautes,
    getLivresParCategorie,
    type LivresFilters,
} from '@/lib/queries/livres';

const PAGE_SIZE_CATALOGUE = 24;
const PAGE_SIZE_SEARCH = 8;

export async function loadMoreLivres(filters: LivresFilters, offset: number) {
    let result;
    if (filters.cat) result = await getLivresParCategorie(filters.cat, offset);
    else {
        const limit = filters.q ? PAGE_SIZE_SEARCH : PAGE_SIZE_CATALOGUE;
        result = await getLivresPubliques({ ...filters, limit, offset });
    }
    return filters.ebook ? result : result.filter((livre) => !livre.isEbook);
}

export async function loadMoreDiscovery(
    type: 'tendances' | 'nouveautes',
    startIndex: number,
    showEbook = false,
) {
    const result =
        type === 'tendances'
            ? await getLivresTendances(startIndex)
            : await getLivresNouveautes(startIndex);
    return showEbook ? result : result.filter((livre) => !livre.isEbook);
}
