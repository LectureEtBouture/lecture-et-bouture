const BLOCS = [
    {
        label: "Qu'est-ce qu'une bouture",
        texte: "Une jeune plante issue d'un fragment prélevé sur un spécimen parent. Plus fragile qu'une plante adulte les premières semaines, elle offre en retour la satisfaction de la voir pousser depuis ses débuts.",
    },
    {
        label: 'Entretien',
        texte: 'Chaque fiche indique les besoins en lumière, en arrosage et la difficulté générale. Nos boutures sont choisies pour leur robustesse relative — même les espèces exigeantes restent accessibles avec un peu de régularité.',
    },
    {
        label: 'Notre démarche',
        texte: 'Nous sélectionnons des espèces pour leur caractère, leur rareté ou leur capacité à habiter un intérieur durablement. Pas de collections saisonnières, pas de tendances. Des plantes que nous connaissons bien.',
    },
];

export function BoutureIntro() {
    return (
        <section className="border-t border-border pt-section grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            {BLOCS.map((bloc) => (
                <div key={bloc.label} className="space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] font-medium text-primary">
                        {bloc.label}
                    </p>
                    <p className="text-sm text-foreground leading-[1.75] max-w-[40ch]">
                        {bloc.texte}
                    </p>
                </div>
            ))}
        </section>
    );
}
