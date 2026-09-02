import * as schema from './schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

type AppDatabase = BetterSQLite3Database<typeof schema>;

let _cachedDb: AppDatabase | null = null;

export function getDb(): AppDatabase {
  // 1. In Cloudflare Workers / Pages runtime with D1 binding attached to global/env
  const cfDb =
    (typeof process !== 'undefined' && ((process.env as any)?.kamus_bajau_db || (process.env as any)?.DB)) ||
    (globalThis as any)?.kamus_bajau_db ||
    (globalThis as any)?.DB ||
    (globalThis as any)?.__D1_BETA__?.kamus_bajau_db ||
    (globalThis as any)?.__D1_BETA__?.DB;
  if (cfDb) {
    const { drizzle } = require('drizzle-orm/d1');
    return drizzle(cfDb, { schema }) as unknown as AppDatabase;
  }



  // 3. Fallback to local SQLite database in Node.js development server
  if (!_cachedDb) {
    try {
      const dynamicRequire = eval('require');
      const Database = dynamicRequire('better-sqlite3');
      const { drizzle } = dynamicRequire('drizzle-orm/better-sqlite3');
      const path = dynamicRequire('path');

      const dbPath = path.resolve(process.cwd(), 'dictionary.db');
      const sqlite = new Database(dbPath);

      try {
        sqlite.pragma('journal_mode = WAL');
        sqlite.pragma('foreign_keys = ON');
      } catch {}

      _cachedDb = drizzle(sqlite, { schema }) as AppDatabase;
    } catch (err) {
      console.warn('Local SQLite not available in this runtime.');
    }
  }


  return _cachedDb as AppDatabase;
}

// Proxied db instance for seamless drop-in queries across all environments
export const db = new Proxy({} as AppDatabase, {
  get(_target, prop, receiver) {
    const instance = getDb() as any;
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});


