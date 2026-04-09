import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const gitignoreEntries = [".assist-*", ".assist/*.db*"];

export function ensureGitignore(dir: string): void {
	const gitignorePath = join(dir, ".gitignore");
	const existing = existsSync(gitignorePath)
		? readFileSync(gitignorePath, "utf-8")
		: "";
	const lines = existing.split("\n");
	const missing = gitignoreEntries.filter((entry) => !lines.includes(entry));
	if (missing.length === 0) return;
	const suffix = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
	writeFileSync(gitignorePath, `${existing}${suffix}${missing.join("\n")}\n`);
}
