import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import { config } from '../config/index.js';

const queryClient = postgres(config.db.url);
export const db = drizzle(queryClient, { schema });

export type DB = typeof db;
