import type { SlashCommand } from "../../slashCommands/readSlashCommands";

const scopeOrder = { user: 0, project: 1 } as const;

export function matchSlashCommands(
	commands: SlashCommand[],
	query: string,
): SlashCommand[] {
	const prefix = query.toLowerCase();
	return commands
		.filter((command) => command.name.toLowerCase().startsWith(prefix))
		.sort(
			(a, b) =>
				scopeOrder[a.scope] - scopeOrder[b.scope] ||
				a.name.localeCompare(b.name),
		);
}
