import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/lib/metadata';
import {
    getHoraires,
    getReseauxSociaux,
    getFermetures,
} from '@/lib/queries/parametres';
import { getPublishedEditorialSlugs } from '@/lib/queries/pages';
import { HorairesDisplay } from '@/components/ui/HorairesDisplay';
import { NewsletterSection } from '@/components/ui/NewsletterSection';

const navExplorer = [
    { href: '/livres', label: 'Livres', editorialSlug: null },
    { href: '/boutures', label: 'Boutures', editorialSlug: null },
    { href: '/selections', label: 'Sélections', editorialSlug: null },
    { href: '/evenements', label: 'Événements', editorialSlug: null },
    { href: '/surprendre', label: 'Me faire surprendre', editorialSlug: null },
];

const navBoutique = [
    { href: '/concept', label: 'Notre concept', editorialSlug: 'concept' },
    { href: '/contact', label: 'Contact', editorialSlug: null },
];

const navLegal = [
    {
        href: '/mentions-legales',
        label: 'Mentions légales',
        editorialSlug: 'mentions-legales',
    },
    {
        href: '/politique-de-confidentialite',
        label: 'Confidentialité',
        editorialSlug: 'politique-de-confidentialite',
    },
    { href: '/cgv', label: 'CGV', editorialSlug: 'cgv' },
    { href: '/cgu', label: 'CGU', editorialSlug: 'cgu' },
    { href: '/cookies', label: 'Cookies', editorialSlug: 'cookies' },
];

function filterLinks(
    links: { href: string; label: string; editorialSlug: string | null }[],
    publishedSlugs: string[],
) {
    return links.filter(
        ({ editorialSlug }) =>
            !editorialSlug || publishedSlugs.includes(editorialSlug),
    );
}

function NavCol({
    label,
    links,
    ariaLabel,
}: {
    label: string;
    links: { href: string; label: string }[];
    ariaLabel: string;
}) {
    return (
        <nav aria-label={ariaLabel}>
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted mb-5">
                {label}
            </p>
            <ul className="space-y-3">
                {links.map(({ href, label: text }) => (
                    <li key={href}>
                        <Link
                            href={href}
                            className="text-sm text-foreground/70 hover:text-primary transition-colors"
                        >
                            {text}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export async function Footer() {
    const [horaires, fermetures, reseaux, publishedSlugs] = await Promise.all([
        getHoraires(),
        getFermetures(),
        getReseauxSociaux(),
        getPublishedEditorialSlugs(),
    ]);

    return (
        <footer
            className="border-t border-border bg-background"
            aria-label="Pied de page"
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className="pt-16 pb-14 border-b border-border">
                    <p className="font-serif italic text-4xl sm:text-5xl text-primary leading-[1.1] tracking-tight">
                        {siteConfig.tagline}
                    </p>
                </div>

                <NewsletterSection />

                <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 border-b border-border">
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <Link
                            href="/"
                            className="inline-block hover:opacity-75 transition-opacity"
                        >
                            <Image
                                src="/leb-nobg.png"
                                alt={siteConfig.name}
                                width={485}
                                height={325}
                                className="h-12 w-auto"
                            />
                        </Link>
                        <p className="text-sm text-muted leading-relaxed max-w-[22ch]">
                            {siteConfig.description}
                        </p>
                        <HorairesDisplay
                            horaires={horaires}
                            fermetures={fermetures}
                            className="pt-1"
                        />
                        {reseaux.length > 0 && (
                            <div className="flex flex-wrap gap-3 pt-1">
                                {reseaux.map((r) => (
                                    <a
                                        key={r.platform}
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] uppercase tracking-[0.08em] text-muted hover:text-primary transition-colors"
                                    >
                                        {r.platform}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <NavCol
                        label="Explorer"
                        links={filterLinks(navExplorer, publishedSlugs)}
                        ariaLabel="Explorer le catalogue"
                    />
                    <NavCol
                        label="La boutique"
                        links={filterLinks(navBoutique, publishedSlugs)}
                        ariaLabel="À propos de la boutique"
                    />
                    <NavCol
                        label="Légal"
                        links={filterLinks(navLegal, publishedSlugs)}
                        ariaLabel="Liens légaux"
                    />
                </div>

                <div className="py-5 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-foreground/70">
                        © {new Date().getFullYear()} {siteConfig.name}. Tous
                        droits réservés.
                    </p>
                    <a
                        href="https://www.jsankare.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-foreground/70 hover:text-primary transition-colors"
                    >
                        Site créé par Jordan Sankaré
                    </a>
                </div>
            </div>
        </footer>
    );
}
