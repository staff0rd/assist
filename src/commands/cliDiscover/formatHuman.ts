import { classifyVerb } from "./classifyVerb";

type Command = { path: string[]; description: string };

function prefix(kind: "r" | "w" | "?"): string {
	if (kind === "r") return " R  ";
	if (kind === "w") return " W  ";
	return " ?  ";
}

export function formatHuman(cli: string, commands: Command[]): string {
	const sorted = [...commands].sort((a, b) =>
		a.path.join(" ").localeCompare(b.path.join(" ")),
	);
	const lines = [`Discovered ${commands.length} commands for "${cli}":\n`];
	for (const cmd of sorted) {
		const verb = cmd.path[cmd.path.length - 1];
		const full = `${cli} ${cmd.path.join(" ")}`;
		const text = cmd.description ? `${full} — ${cmd.description}` : full;
		lines.push(`${prefix(classifyVerb(verb))}${text}`);
	}
	return lines.join("\n");
}
