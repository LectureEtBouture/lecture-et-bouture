import {
    getAvis,
    approveAvis,
    rejectAvis,
    deleteAvis,
} from '@/lib/actions/avis';

export default async function AdminAvisPage() {
    const data = await getAvis();
    const enAttente = data.filter((a) => !a.approuve);
    const approuves = data.filter((a) => a.approuve);

    return (
        <div className="space-y-8">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Avis
            </h1>

            {enAttente.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-widest text-muted">
                        En attente ({enAttente.length})
                    </h2>
                    {enAttente.map((a) => (
                        <AvisRow key={a.id} avis={a} />
                    ))}
                </section>
            )}

            {approuves.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-widest text-muted">
                        Approuvés ({approuves.length})
                    </h2>
                    {approuves.map((a) => (
                        <AvisRow key={a.id} avis={a} />
                    ))}
                </section>
            )}

            {data.length === 0 && (
                <p className="text-sm text-muted">
                    Aucun avis pour l&apos;instant.
                </p>
            )}
        </div>
    );
}

function AvisRow({
    avis: a,
}: {
    avis: Awaited<ReturnType<typeof getAvis>>[number];
}) {
    const produit = a.type === 'livre' ? a.livreTitre : a.planteNom;

    return (
        <div className="bg-white border border-border px-5 py-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                        {a.auteurNom}
                    </p>
                    <p className="text-xs text-muted">
                        {a.type === 'livre' ? 'Livre' : 'Plante'} ·{' '}
                        {produit ?? '—'} · {'★'.repeat(a.note)}
                        {'☆'.repeat(5 - a.note)}
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {!a.approuve && (
                        <form
                            action={async () => {
                                'use server';
                                await approveAvis(a.id);
                            }}
                        >
                            <button
                                type="submit"
                                className="text-xs text-[#2D4B3E] hover:underline"
                            >
                                Approuver
                            </button>
                        </form>
                    )}
                    {a.approuve && (
                        <form
                            action={async () => {
                                'use server';
                                await rejectAvis(a.id);
                            }}
                        >
                            <button
                                type="submit"
                                className="text-xs text-muted hover:underline"
                            >
                                Retirer
                            </button>
                        </form>
                    )}
                    <form
                        action={async () => {
                            'use server';
                            await deleteAvis(a.id);
                        }}
                    >
                        <button
                            type="submit"
                            className="text-xs text-muted hover:text-red-600 transition-colors"
                        >
                            Supprimer
                        </button>
                    </form>
                </div>
            </div>
            {a.texte && <p className="text-sm text-foreground/80">{a.texte}</p>}
        </div>
    );
}
