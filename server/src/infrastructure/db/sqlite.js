import Database from 'better-sqlite3';
import config from '../../config/index.js';

const db = new Database(config.db.uri);

function ensureTable(collection) {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS ${collection} (
      id TEXT PRIMARY KEY,
      data TEXT
    )
  `).run();
}

const sqliteAdapter = {
  insert: async (collection, item) => {
    ensureTable(collection);
    const stmt = db.prepare(`INSERT INTO ${collection} (id, data) VALUES (?, ?)`);
    stmt.run(item.id, JSON.stringify(item));
    return item;
  },

  findAll: async (collection) => {
    ensureTable(collection);
    const rows = db.prepare(`SELECT data FROM ${collection}`).all();
    return rows.map((r) => JSON.parse(r.data));
  },

  findById: async (collection, id) => {
    ensureTable(collection);
    const row = db.prepare(`SELECT data FROM ${collection} WHERE id = ?`).get(id);
    return row ? JSON.parse(row.data) : null;
  },

  update: async (collection, id, updates) => {
    const existing = await sqliteAdapter.findById(collection, id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    db.prepare(`UPDATE ${collection} SET data = ? WHERE id = ?`).run(JSON.stringify(updated), id);
    return updated;
  },

  remove: async (collection, id) => {
    const stmt = db.prepare(`DELETE FROM ${collection} WHERE id = ?`);
    return stmt.run(id).changes > 0;
  },
};

export default sqliteAdapter;
