import { closeSync, openSync, readdirSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { findRepoRoot } from "../../shared/findRepoRoot";

const SKIP_DIRS = new Set(["node_modules", ".git", "packages"]);

function isLockedDll(debugDir: string): string | null {
	let files: string[];
	try {
		files = readdirSync(debugDir, { recursive: true }) as string[];
	} catch {
		return null;
	}
	for (const file of files) {
		if (!file.toLowerCase().endsWith(".dll")) continue;
		const dllPath = join(debugDir, file);
		try {
			const fd = openSync(dllPath, "r+");
			closeSync(fd);
		} catch {
			return dllPath;
		}
	}
	return null;
}

function findFirstLockedDll(dir: string): string | null {
	let entries: string[];
	try {
		entries = readdirSync(dir);
	} catch {
		return null;
	}

	if (entries.includes("bin")) {
		const locked = isLockedDll(join(dir, "bin", "Debug"));
		if (locked) return locked;
	}

	for (const entry of entries) {
		if (SKIP_DIRS.has(entry) || entry === "bin" || entry.startsWith("."))
			continue;
		const found = findFirstLockedDll(join(dir, entry));
		if (found) return found;
	}
	return null;
}

function getSearchRoot(): string {
	return findRepoRoot(process.cwd()) ?? process.cwd();
}

export function checkBuildLocks(startDir?: string): void {
	const locked = findFirstLockedDll(startDir ?? getSearchRoot());
	if (locked) {
		console.error(
			chalk.red("Build output locked (is VS debugging?): ") + locked,
		);
		process.exit(1);
	}
}

export async function checkBuildLocksCommand(): Promise<void> {
	checkBuildLocks();
	console.log(chalk.green("No build locks detected"));
}
