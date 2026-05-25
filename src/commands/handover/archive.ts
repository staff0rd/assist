import { existsSync, mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { formatArchiveTimestamp } from "./formatArchiveTimestamp";
import { getHandoverArchiveDir } from "./getHandoverArchiveDir";
import { getHandoverPath } from "./getHandoverPath";

const MAX_COLLISION_SUFFIX = 99;

type ArchiveOptions = {
	suffix?: string;
	cwd?: string;
	now?: Date;
};

function buildArchiveFilename(timestamp: string, suffix?: string): string {
	const base = suffix ? `${timestamp}-${suffix}` : timestamp;
	return `${base}.md`;
}

function resolveCollisionPath(
	archiveDir: string,
	timestamp: string,
	suffix: string | undefined,
): string {
	const initial = join(archiveDir, buildArchiveFilename(timestamp, suffix));
	if (!existsSync(initial)) return initial;

	for (let i = 1; i <= MAX_COLLISION_SUFFIX; i++) {
		const collisionSuffix = suffix ? `${suffix}-${i}` : `${i}`;
		const candidate = join(
			archiveDir,
			buildArchiveFilename(timestamp, collisionSuffix),
		);
		if (!existsSync(candidate)) return candidate;
	}

	throw new Error(
		`Exhausted collision suffixes (1-${MAX_COLLISION_SUFFIX}) for ${timestamp}`,
	);
}

export function archive(options: ArchiveOptions = {}): string | undefined {
	const cwd = options.cwd ?? process.cwd();
	const handoverPath = getHandoverPath(cwd);
	if (!existsSync(handoverPath)) return undefined;

	const archiveDir = getHandoverArchiveDir(cwd);
	mkdirSync(archiveDir, { recursive: true });

	const timestamp = formatArchiveTimestamp(options.now);
	const destination = resolveCollisionPath(
		archiveDir,
		timestamp,
		options.suffix,
	);

	renameSync(handoverPath, destination);
	return destination;
}
