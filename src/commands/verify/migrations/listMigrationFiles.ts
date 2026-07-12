import { readdirSync } from "node:fs";

const MIGRATION_FILE = /^migration\d+[A-Za-z0-9]*\.ts$/;

export function listMigrationFiles(dir: string): string[] {
	return readdirSync(dir).filter((file) => MIGRATION_FILE.test(file));
}
