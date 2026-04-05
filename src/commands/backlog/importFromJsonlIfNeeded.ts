import { readFileSync, statSync } from "node:fs";
import { getJsonlPath } from "./exportToJsonl";
import type { BacklogDb } from "./openDb";
import { saveAllItems } from "./saveAllItems";
import type { BacklogItem } from "./types";
import { backlogItemSchema } from "./types";

function getLastImportMs(db: BacklogDb): number {
	const row = db
		.prepare("SELECT value FROM metadata WHERE key = 'jsonl_last_import_ms'")
		.get() as { value: string } | undefined;
	return row ? Number(row.value) : 0;
}

function setLastImportMs(db: BacklogDb, ms: number): void {
	db.prepare(
		"INSERT INTO metadata (key, value) VALUES ('jsonl_last_import_ms', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
	).run(String(ms));
}

export function importFromJsonlIfNeeded(db: BacklogDb, dir: string): void {
	const jsonlPath = getJsonlPath(dir);

	let stat: ReturnType<typeof statSync> | undefined;
	try {
		stat = statSync(jsonlPath);
	} catch {
		return;
	}

	const fileMtimeMs = stat.mtimeMs;
	const lastImportMs = getLastImportMs(db);

	if (fileMtimeMs <= lastImportMs) return;

	const content = readFileSync(jsonlPath, "utf-8").trim();
	if (content.length === 0) {
		setLastImportMs(db, fileMtimeMs);
		return;
	}

	const items: BacklogItem[] = content.split("\n").map((line) => {
		const parsed = JSON.parse(line);
		return backlogItemSchema.parse(parsed);
	});

	saveAllItems(db, items);
	setLastImportMs(db, fileMtimeMs);
}
