import { neon } from '@netlify/neon';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const client = neon(); // uses NETLIFY_DATABASE_URL automatically
export const db = drizzle({ client, schema });
