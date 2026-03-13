const fs = require('fs/promises');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'locks.json');

async function ensureDb() {
  try {
    await fs.access(dbPath);
  } catch (error) {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, '[]', 'utf8');
  }
}

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(dbPath, 'utf8');
  if (!raw.trim()) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeDb(locks) {
  await fs.writeFile(dbPath, JSON.stringify(locks, null, 2), 'utf8');
}

async function createLock(lock) {
  const locks = await readDb();
  locks.push(lock);
  await writeDb(locks);
  return lock;
}

async function getLockByToken(token) {
  const locks = await readDb();
  return locks.find((lock) => lock.token === token) || null;
}

async function getLockById(id) {
  const locks = await readDb();
  return locks.find((lock) => lock.id === id) || null;
}

async function getLockBySessionId(sessionId) {
  if (!sessionId) return null;
  const locks = await readDb();
  return locks.find((lock) => lock.stripe && lock.stripe.session_id === sessionId) || null;
}

async function updateLock(id, patch) {
  const locks = await readDb();
  const index = locks.findIndex((lock) => lock.id === id);
  if (index < 0) return null;
  const updated = {
    ...locks[index],
    ...patch,
    updated_at: new Date().toISOString()
  };
  locks[index] = updated;
  await writeDb(locks);
  return updated;
}

module.exports = {
  createLock,
  getLockByToken,
  getLockById,
  getLockBySessionId,
  updateLock
};
