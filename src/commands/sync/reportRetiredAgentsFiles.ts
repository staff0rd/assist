import * as fs from "node:fs";
import * as path from "node:path";
import { harnesses } from "../../shared/harnesses";

const retired = [
	path.join(harnesses.claude.homeDir, "CLAUDE.md"),
	path.join(harnesses.codex.homeDir, "AGENTS.md"),
	path.join(harnesses.pi.homeDir, "AGENTS.md"),
];

export function reportRetiredAgentsFiles(): void {
	const leftovers = retired.filter((file) => fs.existsSync(file));
	if (leftovers.length === 0) return;

	console.log(
		"No longer written by sync — each harness now composes its own advice at session start:",
	);
	for (const file of leftovers) console.log(`  ${file}`);
	console.log(
		"  Delete them, or they keep injecting the retired global instructions.",
	);
}
