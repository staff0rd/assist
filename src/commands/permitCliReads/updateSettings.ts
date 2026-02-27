import { loadCliReads, saveCliReads } from "../../shared/loadCliReads";
import { classifyVerb } from "./classifyVerb";

type Command = { path: string[]; description: string };

export function updateSettings(cli: string, commands: Command[]): void {
	const existing = loadCliReads();

	const readEntries = commands
		.filter((cmd) => classifyVerb(cmd.path[cmd.path.length - 1]) === "r")
		.map((cmd) => `${cli} ${cmd.path.join(" ")}`);

	const merged = [...new Set([...existing, ...readEntries])].sort();
	if (
		merged.length === existing.length &&
		merged.every((e, i) => e === existing[i])
	)
		return;

	saveCliReads(merged);
}
