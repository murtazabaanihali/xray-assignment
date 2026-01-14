import { Database } from "bun:sqlite";

export const db = new Database("steps.db");

export const initDB = () => {
    db.run(`
        CREATE TABLE IF NOT EXISTS steps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);

    console.log("Initialized DB...");
};
