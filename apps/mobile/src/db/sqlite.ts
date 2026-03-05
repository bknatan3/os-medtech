import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("os_medtech.db");

export async function initDb() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mutation_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      operation_type TEXT NOT NULL,
      entity TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      retry_count INTEGER DEFAULT 0,
      last_error TEXT
    );
  `);
}

export async function enqueueMutation(operation: string, entity: string, payload: unknown) {
  const mutationId = crypto.randomUUID();
  db.runSync(
    "INSERT INTO outbox (mutation_id, created_at, operation_type, entity, payload_json) VALUES (?, ?, ?, ?, ?)",
    [mutationId, new Date().toISOString(), operation, entity, JSON.stringify(payload)]
  );
}

export async function listPendingMutations() {
  return db.getAllSync("SELECT * FROM outbox ORDER BY id ASC");
}

export async function clearMutation(id: number) {
  db.runSync("DELETE FROM outbox WHERE id = ?", [id]);
}
