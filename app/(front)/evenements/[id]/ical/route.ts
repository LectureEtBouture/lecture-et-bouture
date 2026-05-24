import { notFound } from 'next/navigation';
import { getEvenementById } from '@/lib/queries/evenements';
import { siteConfig } from '@/lib/metadata';

function toIcalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function esc(str: string): string {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const ev = await getEvenementById(id);
    if (!ev) notFound();

    const dtStart = toIcalDate(new Date(ev.dateDebut));
    const dtEnd = ev.dateFin
        ? toIcalDate(new Date(ev.dateFin))
        : toIcalDate(
              new Date(new Date(ev.dateDebut).getTime() + 2 * 60 * 60 * 1000),
          );

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        `PRODID:-//${esc(siteConfig.name)}//FR`,
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${esc(id)}@${new URL(siteConfig.url).hostname}`,
        `DTSTAMP:${toIcalDate(new Date())}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${esc(ev.titre)}`,
        ev.description ? `DESCRIPTION:${esc(ev.description)}` : '',
        ev.lieu ? `LOCATION:${esc(ev.lieu)}` : '',
        `URL:${siteConfig.url.replace(/\/$/, '')}/evenements`,
        'END:VEVENT',
        'END:VCALENDAR',
    ]
        .filter(Boolean)
        .join('\r\n');

    return new Response(lines, {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="${esc(ev.titre)
                .replace(/[^a-z0-9]/gi, '-')
                .toLowerCase()}.ics"`,
            'Cache-Control': 'no-store',
        },
    });
}
