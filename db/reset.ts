import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function main() {
    const client = postgres(process.env['DATABASE_URL'] as string);
    const db = drizzle(client);

    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);

    await client.end();
    console.log('Schema wiped. Run db:migrate then db:seed.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
