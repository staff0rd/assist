import { existsSync, readFileSync, renameSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import type { BacklogDb } from "./openDb";
import { saveAllItems } from "./saveAllItems";
import { backlogFileSchema } from "./types";

export function migrateYamlIfNeeded(db: BacklogDb, yamlPath: string): boolean {
	if (!existsSync(yamlPath)) return false;

	const existing = db.prepare("SELECT COUNT(*) as count FROM items").get() as {
		count: number;
	};
	if (existing.count > 0) return false;

	const content = readFileSync(yamlPath, "utf-8");
	const raw = parseYaml(content) || [];
	const items = backlogFileSchema.parse(raw);
	if (items.length > 0) {
		saveAllItems(db, items);
		renameSync(yamlPath, `${yamlPath}.bak`);
		return true;
	}
	return false;
}
