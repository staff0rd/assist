import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { classifyVerb } from "./classifyVerb";

type Command = { path: string[]; description: string };

type Settings = {
	permissions?: { allow?: string[]; deny?: string[] };
	[key: string]: unknown;
};

function settingsPath(): string {
	return join(process.cwd(), "claude", "settings.json");
}

export function updateSettings(cli: string, commands: Command[]): void {
	const path = settingsPath();
	if (!existsSync(path)) return;

	const settings: Settings = JSON.parse(readFileSync(path, "utf-8"));
	const allow = settings.permissions?.allow ?? [];

	const readCommands = commands.filter(
		(cmd) => classifyVerb(cmd.path[cmd.path.length - 1]) === "r",
	);

	const newEntries = readCommands.map(
		(cmd) => `Bash(${cli} ${cmd.path.join(" ")}:*)`,
	);

	const existing = new Set(allow);
	const added = newEntries.filter((e) => !existing.has(e));
	if (added.length === 0) return;

	settings.permissions = settings.permissions ?? {};
	settings.permissions.allow = [...allow, ...added];
	writeFileSync(path, `${JSON.stringify(settings, null, "\t")}\n`);
}
