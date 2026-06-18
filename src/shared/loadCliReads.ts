import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function packageRoot(): string {
	return __dirname;
}

function readLines(path: string): string[] {
	if (!existsSync(path)) return [];
	return readFileSync(path, "utf8")
		.split("\n")
		.filter((line) => line.trim() !== "");
}

/** Cached lines from allowed.cli-reads — loaded once per process. */
let cachedReads: string[] | undefined;
/** Cached lines from allowed.cli-writes — loaded once per process. */
let cachedWrites: string[] | undefined;

function getCliReadsLines(): string[] {
	if (!cachedReads) {
		cachedReads = readLines(resolve(packageRoot(), "allowed.cli-reads"));
	}
	return cachedReads;
}

function getCliWritesLines(): string[] {
	if (!cachedWrites) {
		cachedWrites = readLines(resolve(packageRoot(), "allowed.cli-writes"));
	}
	return cachedWrites;
}

export function loadCliReads(): string[] {
	return getCliReadsLines();
}

export function saveCliReads(commands: string[]): void {
	writeFileSync(
		resolve(packageRoot(), "allowed.cli-reads"),
		`${commands.join("\n")}\n`,
	);
	cachedReads = undefined; // bust cache
}

function findMatch(command: string, lines: string[]): string | undefined {
	const words = command.split(/\s+/);
	if (words.length === 0) return undefined;

	// Match single-word entries (e.g. "head", "cat", "ls")
	if (lines.includes(words[0])) return words[0];

	if (words.length < 2) return undefined;

	const prefix = `${words[0]} ${words[1]}`;
	const candidates = lines.filter(
		(line) => line === prefix || line.startsWith(`${prefix} `),
	);

	return candidates
		.sort((a, b) => b.length - a.length)
		.find((rc) => command === rc || command.startsWith(`${rc} `));
}

export function findCliRead(command: string): string | undefined {
	return findMatch(command, getCliReadsLines());
}

export function findCliWrite(command: string): string | undefined {
	return findMatch(command, getCliWritesLines());
}
