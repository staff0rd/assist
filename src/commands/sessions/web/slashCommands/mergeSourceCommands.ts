import type { SlashCommand } from "./mergeSlashCommands";

export function mergeSourceCommands(lists: SlashCommand[][]): SlashCommand[] {
	const byName = new Map<string, SlashCommand>();
	for (const command of lists.flat())
		if (!byName.has(command.name)) byName.set(command.name, command);
	return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}
