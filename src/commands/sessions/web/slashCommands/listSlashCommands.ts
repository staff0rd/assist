import path from "node:path";
import { mergeSourceCommands } from "./mergeSourceCommands";
import { readSlashCommands, type SlashCommand } from "./readSlashCommands";
import type { SlashCommandSources } from "../../../../shared/harnesses";

export function listSlashCommands(
	sources: SlashCommandSources,
	cwd: string,
	projectCommands?: SlashCommand[] | null,
): SlashCommand[] {
	const user = mergeSourceCommands(
		sources.userHomes.map((home) => readSlashCommands(home, "user")),
	);
	const userNames = new Set(user.map((command) => command.name));
	const project =
		projectCommands ??
		mergeSourceCommands(
			sources.projectDirs.map((dir) =>
				readSlashCommands(path.join(cwd, dir), "project"),
			),
		);
	return [
		...user,
		...project.filter((command) => !userNames.has(command.name)),
	];
}
