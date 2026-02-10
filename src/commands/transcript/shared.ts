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

function collectFiles(dir: string, extension: string): string[] {
	if (!existsSync(dir)) return [];

	const results: string[] = [];
	for (const entry of readdirSync(dir)) {
		const fullPath = join(dir, entry);
		if (statSync(fullPath).isDirectory()) {
			results.push(...collectFiles(fullPath, extension));
		} else if (entry.endsWith(extension)) {
			results.push(fullPath);
		}
	}
	return results;
}

function toFileInfo(baseDir: string, fullPath: string) {
	return {
		absolutePath: fullPath,
		relativePath: relative(baseDir, fullPath),
		filename: basename(fullPath),
	};
}

export function findVttFilesRecursive(
	dir: string,
	baseDir: string = dir,
): VttFileInfo[] {
	return collectFiles(dir, ".vtt").map((f) => toFileInfo(baseDir, f));
}

export function findMdFilesRecursive(
	dir: string,
	baseDir: string = dir,
): MdFileInfo[] {
	return collectFiles(dir, ".md").map((f) => toFileInfo(baseDir, f));
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
