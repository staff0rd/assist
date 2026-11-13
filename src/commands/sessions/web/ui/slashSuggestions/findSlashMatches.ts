import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { matchSlashCommands } from "./matchSlashCommands";
import { slashWordAt } from "./slashWordAt";

export function findSlashMatches(
	commands: SlashCommand[],
	value: string,
	cursor: number,
) {
	const word = slashWordAt(value, cursor);
	if (!word) return null;
	return {
		word,
		matches: matchSlashCommands(commands, word.query),
		key: `${word.start}:${word.query}`,
	};
}
