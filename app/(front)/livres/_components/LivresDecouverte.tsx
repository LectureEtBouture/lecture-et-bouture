import type { LivreComplet } from '@/lib/services/books/types';
import type { GenreFacette } from '@/lib/queries/livres-facets';
import { DiscoverySection } from './DiscoverySection';

interface Props {
    tendances: LivreComplet[];
    nouveautes: LivreComplet[];
    genresList: GenreFacette[];
    view: 'both' | 'tendances' | 'nouveautes';
    showEbook?: boolean;
}

export function LivresDecouverte({ tendances, nouveautes, genresList, view, showEbook = false }: Props) {
    return (
        <div className="space-y-14">
            {(view === 'both' || view === 'tendances') && (
                <DiscoverySection
                    titre="Tendances"
                    initialItems={tendances}
                    type="tendances"
                    genresList={genresList}
                    showEbook={showEbook}
                />
            )}
            {(view === 'both' || view === 'nouveautes') && (
                <DiscoverySection
                    titre="Nouveautés"
                    initialItems={nouveautes}
                    type="nouveautes"
                    genresList={genresList}
                    showEbook={showEbook}
                />
            )}
        </div>
    );
}
