import fs from 'fs-extra';
import path from 'path';
import { Lock } from './types';

// We point to the same DB as the original app for continuity
// DB path relative to project root
const dbPath = path.join(process.cwd(), 'db', 'locks.json');

async function ensureDb() {
  try {
    await fs.access(dbPath);
  } catch (error) {
    await fs.mkdirp(path.dirname(dbPath));
    await fs.writeFile(dbPath, '[]', 'utf8');
  }
}

export async function readDb(): Promise<Lock[]> {
  await ensureDb();
  const raw = await fs.readFile(dbPath, 'utf8');
  if (!raw.trim()) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeDb(locks: Lock[]) {
  await fs.writeFile(dbPath, JSON.stringify(locks, null, 2), 'utf8');
}

export async function createLock(lock: Lock) {
  const locks = await readDb();
  locks.push(lock);
  await writeDb(locks);
  return lock;
}

export async function getLockByToken(token: string): Promise<Lock | null> {
  const locks = await readDb();
  return locks.find((lock) => lock.token === token) || null;
}

export async function getLockById(id: string): Promise<Lock | null> {
  const locks = await readDb();
  return locks.find((lock) => lock.id === id) || null;
}

export async function getLockBySessionId(sessionId: string): Promise<Lock | null> {
  if (!sessionId) return null;
  const locks = await readDb();
  return locks.find((lock) => lock.stripe && lock.stripe.session_id === sessionId) || null;
}

export async function updateLock(id: string, patch: Partial<Lock>) {
  const locks = await readDb();
  const index = locks.findIndex((lock) => lock.id === id);
  if (index < 0) return null;
  const updated: Lock = {
    ...locks[index],
    ...patch,
    updated_at: new Date().toISOString()
  };
  locks[index] = updated;
  await writeDb(locks);
  return updated;
}
