import { mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { ensureGitignore } from "./ensureGitignore";

let _db: ReturnType<typeof Database> | undefined;

function getDbPath(dir: string): string {
	return join(dir, ".assist", "backlog.db");
}

function migrateCommentsAddId(db: ReturnType<typeof Database>): void {
	const cols = db.pragma("table_info(comments)") as Array<{ name: string }>;
	if (cols.length === 0 || cols.some((c) => c.name === "id")) return;
	db.exec(`
		CREATE TABLE comments_new (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
			idx INTEGER NOT NULL,
			text TEXT NOT NULL,
			phase INTEGER,
			timestamp TEXT NOT NULL,
			type TEXT NOT NULL DEFAULT 'comment'
		);
		INSERT INTO comments_new (item_id, idx, text, phase, timestamp, type)
			SELECT item_id, idx, text, phase, timestamp, type FROM comments;
		DROP TABLE comments;
		ALTER TABLE comments_new RENAME TO comments;
	`);
}

function initSchema(db: ReturnType<typeof Database>): void {
	db.exec(`
		CREATE TABLE IF NOT EXISTS items (
			id INTEGER PRIMARY KEY,
			type TEXT NOT NULL DEFAULT 'story',
			name TEXT NOT NULL,
			description TEXT,
			acceptance_criteria TEXT NOT NULL DEFAULT '[]',
			status TEXT NOT NULL DEFAULT 'todo',
			current_phase INTEGER
		);

		CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
			idx INTEGER NOT NULL,
			text TEXT NOT NULL,
			phase INTEGER,
			timestamp TEXT NOT NULL,
			type TEXT NOT NULL DEFAULT 'comment'
		);

		CREATE TABLE IF NOT EXISTS links (
			item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
			type TEXT NOT NULL,
			target_id INTEGER NOT NULL,
			PRIMARY KEY (item_id, type, target_id)
		);

		CREATE TABLE IF NOT EXISTS plan_phases (
			item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
			idx INTEGER NOT NULL,
			name TEXT NOT NULL,
			manual_checks TEXT,
			PRIMARY KEY (item_id, idx)
		);

		CREATE TABLE IF NOT EXISTS plan_tasks (
			item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
			phase_idx INTEGER NOT NULL,
			idx INTEGER NOT NULL,
			task TEXT NOT NULL,
			PRIMARY KEY (item_id, phase_idx, idx),
			FOREIGN KEY (item_id, phase_idx) REFERENCES plan_phases(item_id, idx) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS metadata (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL
		);
	`);
}

export function openDb(dir: string): ReturnType<typeof Database> {
	if (_db) return _db;
	const dbPath = getDbPath(dir);
	mkdirSync(join(dir, ".assist"), { recursive: true });
	const db = new Database(dbPath);
	db.pragma("journal_mode = WAL");
	db.pragma("foreign_keys = ON");
	initSchema(db);
	migrateCommentsAddId(db);
	ensureGitignore(dir);
	_db = db;
	return db;
}

export type BacklogDb = ReturnType<typeof Database>;
