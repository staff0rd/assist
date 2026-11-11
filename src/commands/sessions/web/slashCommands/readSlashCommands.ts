import fs from "node:fs";
import path from "node:path";
import { splitFrontmatter } from "../../../sync/splitFrontmatter";

export type SlashCommand = {
	name: string;
	description?: string;
	scope: "user" | "project";
};

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

function readSkills(dir: string): Omit<SlashCommand, "scope">[] {
	return readEntries(dir)
		.filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
		.map((entry) => path.join(dir, entry.name, "SKILL.md"))
		.filter((file) => fs.existsSync(file))
		.map((file) => ({
			name: path.basename(path.dirname(file)),
			description: describe(file),
		}));
}

function readCommands(dir: string): Omit<SlashCommand, "scope">[] {
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
	const byName = new Map<string, SlashCommand>();
	for (const command of [
		...readCommands(path.join(home, "commands")),
		...readSkills(path.join(home, "skills")),
	])
		byName.set(command.name, { ...command, scope });
	return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}
