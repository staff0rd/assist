import path from "node:path";
import { fileURLToPath } from "node:url";

export function migrationsDir(): string {
	return path.resolve(
		path.dirname(fileURLToPath(import.meta.url)),
		"../../../shared/db/migrations",
	);
}
