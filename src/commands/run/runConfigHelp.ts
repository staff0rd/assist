import type { ConfigHelpEntry } from "../../shared/configHelp";

export const runConfigHelp: ConfigHelpEntry[] = [
	{
		key: "run",
		setter: "assist run add <name> <command>",
		note: "configured commands runnable via assist run <name>",
	},
];
