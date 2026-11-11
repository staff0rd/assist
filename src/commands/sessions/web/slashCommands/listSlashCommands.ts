import path from "node:path";
import { readSlashCommands, type SlashCommand } from "./readSlashCommands";

export function listSlashCommands(
	claudeHome: string,
	cwd: string,
): SlashCommand[] {
	const user = readSlashCommands(claudeHome, "user");
	const userNames = new Set(user.map((command) => command.name));
	const project = readSlashCommands(path.join(cwd, ".claude"), "project");
	return [
		...user,
		...project.filter((command) => !userNames.has(command.name)),
	];
}
