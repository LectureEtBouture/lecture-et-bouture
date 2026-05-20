import argon2 from 'argon2';
import { config } from 'dotenv';

config({ path: '.env.local' });

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email> <password>');
    process.exit(1);
}

if (password.length < 12) {
    console.error('Mot de passe trop court (min 12 caractères)');
    process.exit(1);
}

async function main() {
    const { db } = await import('../db');
    const { users } = await import('../db/schema');

    const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    });

    await db.insert(users).values({ email, passwordHash: hash, role: 'super_admin' });

    console.log(`Utilisateur créé : ${email} (super_admin)`);
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
