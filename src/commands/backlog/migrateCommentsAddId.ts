import type Database from "better-sqlite3";

type Db = ReturnType<typeof Database>;

export function migrateCommentsAddId(db: Db): void {
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

export function migrateToOneBasedPhases(db: Db): void {
	const row = db
		.prepare(
			"SELECT value FROM metadata WHERE key = 'one_based_phases_migrated'",
		)
		.get() as { value: string } | undefined;
	if (row) return;

	db.exec(`
		UPDATE items SET current_phase = current_phase + 1 WHERE current_phase IS NOT NULL;
		UPDATE comments SET phase = phase + 1 WHERE phase IS NOT NULL;
		INSERT INTO metadata (key, value) VALUES ('one_based_phases_migrated', '1')
			ON CONFLICT(key) DO UPDATE SET value = excluded.value;
	`);
}
