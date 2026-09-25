import type { ConfigHelpEntry } from "../../shared/configHelp";

export const refactorConfigHelp: ConfigHelpEntry[] = [
	{
		key: "restructure.ignore",
		setter: 'assist config set restructure.ignore "src/generated/**"',
		note: "globs (relative to cwd) of files restructure never moves; they are treated as outside the root",
	},
];
