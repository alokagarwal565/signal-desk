import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import * as schema from './schema.js';

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');

  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema });

  console.log('Seeding database...');

  // Create a demo user
  const passwordHash = await bcrypt.hash('password123', 10);
  const [user] = await db
    .insert(schema.users)
    .values({
      email: 'demo@signaldesk.app',
      passwordHash,
      name: 'Demo User',
    })
    .onConflictDoNothing()
    .returning();

  if (user) {
    console.log(`Created demo user: ${user.email} (password: password123)`);
  } else {
    console.log('Demo user already exists');
  }

  console.log('Seed complete.');
  await sql.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
