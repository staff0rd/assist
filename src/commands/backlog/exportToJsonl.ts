import { statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadAllItems } from "./loadAllItems";
import type { BacklogDb } from "./openDb";

export function getJsonlPath(dir: string): string {
	return join(dir, ".assist", "backlog.jsonl");
}

export function exportToJsonl(db: BacklogDb, dir: string): void {
	const jsonlPath = getJsonlPath(dir);
	const items = loadAllItems(db);
	const lines = items.map((item) => JSON.stringify(item));
	writeFileSync(jsonlPath, lines.length > 0 ? `${lines.join("\n")}\n` : "");

	const mtimeMs = statSync(jsonlPath).mtimeMs;
	db.prepare(
		"INSERT INTO metadata (key, value) VALUES ('jsonl_last_import_ms', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
	).run(String(mtimeMs));
}
