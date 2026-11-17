import type { HarnessKind } from "../../../../../shared/harnesses";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";

const claudeSdkBuiltIns: SlashCommand[] = [
	{
		name: "clear",
		description: "Start a new conversation in this session",
		scope: "built-in",
	},
];

export function withBuiltInSlashCommands(
	harness: HarnessKind | undefined,
	commands: SlashCommand[],
): SlashCommand[] {
	if (harness !== "claude-sdk") return commands;
	const names = new Set(commands.map((command) => command.name));
	return [
		...commands,
		...claudeSdkBuiltIns.filter((command) => !names.has(command.name)),
	];
}
