import fs from "node:fs";
import path from "node:path";
import { splitFrontmatter } from "../../../sync/splitFrontmatter";
import {
	mergeSlashCommands,
	type SlashCommand,
	type SlashEntry,
} from "./mergeSlashCommands";

export type { SlashCommand } from "./mergeSlashCommands";

function readEntries(dir: string): fs.Dirent[] {
	try {
		return fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return [];
	}
}

function describe(file: string): string | undefined {
	try {
		return splitFrontmatter(fs.readFileSync(file, "utf8")).description;
	} catch {
		return undefined;
	}
}

function readSkills(dir: string): SlashEntry[] {
	return readEntries(dir)
		.filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
		.map((entry) => path.join(dir, entry.name, "SKILL.md"))
		.filter((file) => fs.existsSync(file))
		.map((file) => ({
			name: path.basename(path.dirname(file)),
			description: describe(file),
		}));
}

function readCommands(dir: string): SlashEntry[] {
	return readEntries(dir)
		.filter((entry) => !entry.isDirectory() && entry.name.endsWith(".md"))
		.map((entry) => ({
			name: entry.name.slice(0, -".md".length),
			description: describe(path.join(dir, entry.name)),
		}));
}

export function readSlashCommands(
	home: string,
	scope: SlashCommand["scope"],
): SlashCommand[] {
	return mergeSlashCommands(
		readCommands(path.join(home, "commands")),
		readSkills(path.join(home, "skills")),
		scope,
	);
}
