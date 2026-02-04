import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import * as readline from "node:readline";
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

function findFilesRecursive<T extends { absolutePath: string }>(
	dir: string,
	baseDir: string,
	extension: string,
	createEntry: (fullPath: string, relativePath: string, filename: string) => T,
): T[] {
	if (!existsSync(dir)) {
		return [];
	}

	const results: T[] = [];
	const entries = readdirSync(dir);

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			results.push(
				...findFilesRecursive(fullPath, baseDir, extension, createEntry),
			);
		} else if (entry.endsWith(extension)) {
			results.push(createEntry(fullPath, relative(baseDir, fullPath), entry));
		}
	}

	return results;
}

export function findVttFilesRecursive(
	dir: string,
	baseDir: string = dir,
): VttFileInfo[] {
	return findFilesRecursive(dir, baseDir, ".vtt", (abs, rel, name) => ({
		absolutePath: abs,
		relativePath: rel,
		filename: name,
	}));
}

export function findMdFilesRecursive(
	dir: string,
	baseDir: string = dir,
): MdFileInfo[] {
	return findFilesRecursive(dir, baseDir, ".md", (abs, rel, name) => ({
		absolutePath: abs,
		relativePath: rel,
		filename: name,
	}));
}

export function getTranscriptBaseName(transcriptFile: string): string {
	return basename(transcriptFile, ".md").replace(/ Transcription$/, "");
}

export function createReadlineInterface(): readline.Interface {
	return readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
}

export function askQuestion(
	rl: readline.Interface,
	question: string,
): Promise<string> {
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer.trim());
		});
	});
}
