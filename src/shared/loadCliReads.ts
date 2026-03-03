import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getCliReadsPath(): string {
	// Package root: up from dist/ (tsup bundles into dist/index.js)
	return resolve(__dirname, "..", "assist.cli-reads");
}

/** Cached lines from assist.cli-reads — loaded once per process. */
let cachedLines: string[] | undefined;

function getCliReadsLines(): string[] {
	if (cachedLines) return cachedLines;
	const path = getCliReadsPath();
	if (!existsSync(path)) {
		cachedLines = [];
		return cachedLines;
	}
	cachedLines = readFileSync(path, "utf-8")
		.split("\n")
		.filter((line) => line.trim() !== "");
	return cachedLines;
}

export function loadCliReads(): string[] {
	return getCliReadsLines();
}

export function saveCliReads(commands: string[]): void {
	writeFileSync(getCliReadsPath(), `${commands.join("\n")}\n`);
	cachedLines = undefined; // bust cache
}

export function findCliRead(command: string): string | undefined {
	const words = command.split(/\s+/);
	if (words.length < 2) return undefined;

	const prefix = `${words[0]} ${words[1]}`;
	const candidates = getCliReadsLines().filter(
		(line) => line === prefix || line.startsWith(`${prefix} `),
	);

	return candidates
		.sort((a, b) => b.length - a.length)
		.find((rc) => command === rc || command.startsWith(`${rc} `));
}
