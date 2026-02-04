import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import type { MdFileInfo, VttFileInfo } from "./types";

const DATE_PREFIX_REGEX = /^\d{4}-\d{2}-\d{2}/;

export function getDatePrefix(daysOffset = 0): string {
	const date = new Date();
	date.setDate(date.getDate() + daysOffset);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function isValidDatePrefix(filename: string): boolean {
	return DATE_PREFIX_REGEX.test(filename);
}

export function findVttFilesRecursive(
	dir: string,
	baseDir: string = dir,
): VttFileInfo[] {
	const results: VttFileInfo[] = [];
	const entries = readdirSync(dir);

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			results.push(...findVttFilesRecursive(fullPath, baseDir));
		} else if (entry.endsWith(".vtt")) {
			results.push({
				absolutePath: fullPath,
				relativePath: relative(baseDir, fullPath),
				filename: entry,
			});
		}
	}

	return results;
}

export function findMdFilesRecursive(
	dir: string,
	baseDir: string = dir,
): MdFileInfo[] {
	if (!existsSync(dir)) {
		return [];
	}

	const results: MdFileInfo[] = [];
	const entries = readdirSync(dir);

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			results.push(...findMdFilesRecursive(fullPath, baseDir));
		} else if (entry.endsWith(".md")) {
			results.push({
				absolutePath: fullPath,
				relativePath: relative(baseDir, fullPath),
				filename: entry,
			});
		}
	}

	return results;
}

export function getTranscriptBaseName(transcriptFile: string): string {
	return basename(transcriptFile, ".md").replace(/ Transcription$/, "");
}
