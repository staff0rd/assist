import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";

let _db: ReturnType<typeof Database> | undefined;

function getDbDir(): string {
	return join(homedir(), ".assist");
}

function initSchema(db: ReturnType<typeof Database>): void {
	db.exec(`
		CREATE TABLE IF NOT EXISTS denied_tool_calls (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			tool TEXT NOT NULL,
			command TEXT NOT NULL,
			repo TEXT NOT NULL,
			session_id TEXT,
			deny_reason TEXT NOT NULL,
			timestamp TEXT NOT NULL DEFAULT (datetime('now'))
		);
	`);
}

export function openPromptsDb(dir?: string): ReturnType<typeof Database> {
	if (_db) return _db;
	const dbDir = dir ?? getDbDir();
	mkdirSync(dbDir, { recursive: true });
	const db = new Database(join(dbDir, "assist.db"));
	db.pragma("journal_mode = WAL");
	initSchema(db);
	_db = db;
	return db;
}

type DeniedToolCall = {
	tool: string;
	command: string;
	repo: string;
	sessionId?: string;
	denyReason: string;
};

export function logDeniedToolCall(entry: DeniedToolCall): void {
	const db = openPromptsDb();
	db.prepare(
		`INSERT INTO denied_tool_calls (tool, command, repo, session_id, deny_reason)
		 VALUES (@tool, @command, @repo, @sessionId, @denyReason)`,
	).run({
		tool: entry.tool,
		command: entry.command,
		repo: entry.repo,
		sessionId: entry.sessionId ?? null,
		denyReason: entry.denyReason,
	});
}

/** Reset cached DB instance (for testing). */
export function _resetPromptsDb(): void {
	if (_db) {
		_db.close();
		_db = undefined;
	}
}
