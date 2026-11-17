export type SlashCommand = {
	name: string;
	description?: string;
	scope: "user" | "project" | "built-in";
};

export type SlashEntry = Omit<SlashCommand, "scope">;

export function mergeSlashCommands(
	commands: SlashEntry[],
	skills: SlashEntry[],
	scope: SlashCommand["scope"],
): SlashCommand[] {
	const byName = new Map<string, SlashCommand>();
	for (const command of [...commands, ...skills])
		byName.set(command.name, { ...command, scope });
	return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}
