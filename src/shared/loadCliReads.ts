import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getCliReadsPath(): string {
	// Package root: up from dist/ (tsup bundles into dist/index.js)
	return resolve(__dirname, "..", "assist.cli-reads");
}

export function loadCliReads(): string[] {
	const path = getCliReadsPath();
	if (!existsSync(path)) return [];
	return readFileSync(path, "utf-8")
		.split("\n")
		.filter((line) => line.trim() !== "");
}

export function saveCliReads(commands: string[]): void {
	writeFileSync(getCliReadsPath(), `${commands.join("\n")}\n`);
}

export function findCliRead(command: string): string | undefined {
	const filePath = getCliReadsPath();
	if (!existsSync(filePath)) return undefined;

	const words = command.split(/\s+/);
	if (words.length < 2) return undefined;

	const prefix = `${words[0]} ${words[1]}`;
	let candidates: string[];
	try {
		const output = execFileSync("grep", ["-E", `^${prefix}( |$)`, filePath], {
			encoding: "utf-8",
		});
		candidates = output.split("\n").filter((l) => l !== "");
	} catch {
		return undefined;
	}

	return candidates
		.sort((a, b) => b.length - a.length)
		.find((rc) => command === rc || command.startsWith(`${rc} `));
}
