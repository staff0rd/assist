import {
	existsSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
} from "node:fs";
import { basename, join } from "node:path";
import type { Db } from "../../shared/db/Db";
import { getHandoverPath } from "./getHandoverPath";
import { getHandoversDir } from "./getHandoversDir";
import { parseArchiveTimestamp } from "./parseArchiveTimestamp";
import { saveHandover } from "./saveHandover";
import { summariseHandoverContent } from "./summariseHandoverContent";

function collectMarkdown(dir: string): string[] {
	if (!existsSync(dir)) return [];
	const out: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...collectMarkdown(full));
		else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
	}
	return out;
}

async function migrateFile(
	orm: Db,
	origin: string,
	file: string,
	createdAt: Date,
): Promise<void> {
	const content = readFileSync(file, "utf8");
	await saveHandover(orm, {
		origin,
		summary: summariseHandoverContent(content),
		content,
		createdAt,
	});
	rmSync(file);
}

/**
 * Migrate any disk-based handovers for `origin` into the backlog DB and delete
 * the source files. Archived notes under `.assist/handovers/` keep their
 * timestamp from the filename (falling back to the file's mtime); the current
 * `.assist/HANDOVER.md` uses its mtime. Idempotent — once the files are removed
 * a re-run is a no-op. Returns the number of notes migrated.
 */
export async function migrateDiskHandovers(
	orm: Db,
	origin: string,
	cwd: string = process.cwd(),
): Promise<number> {
	let migrated = 0;

	for (const file of collectMarkdown(getHandoversDir(cwd))) {
		const createdAt =
			parseArchiveTimestamp(basename(file)) ?? statSync(file).mtime;
		await migrateFile(orm, origin, file, createdAt);
		migrated++;
	}

	const handoverPath = getHandoverPath(cwd);
	if (existsSync(handoverPath)) {
		await migrateFile(orm, origin, handoverPath, statSync(handoverPath).mtime);
		migrated++;
	}

	return migrated;
}
