import type { Command } from "commander";

export type ConfigHelpEntry = {
	key: string;
	setter: string;
	note: string;
};

const documentedKeys = new Set<string>();

export function getDocumentedConfigKeys(): ReadonlySet<string> {
	return documentedKeys;
}

export function renderConfigHelp(
	entries: ConfigHelpEntry[],
	preamble?: string,
): string {
	const width = Math.max(...entries.map((entry) => entry.setter.length));
	const lines = entries.map(
		(entry) => `  ${entry.setter.padEnd(width)} # ${entry.note}`,
	);
	const body = preamble
		? ["", preamble, "", "Config:", ...lines]
		: ["", "Config:", ...lines];
	return body.join("\n");
}

export function configHelp(
	command: Command,
	entries: ConfigHelpEntry[],
	preamble?: string,
): Command {
	for (const entry of entries) documentedKeys.add(entry.key);
	return command.addHelpText("after", () =>
		renderConfigHelp(entries, preamble),
	);
}
