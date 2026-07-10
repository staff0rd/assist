import type { ConfigHelpEntry } from "../../shared/configHelp";

export const refactorConfigHelp: ConfigHelpEntry[] = [
	{
		key: "restructure.ignore",
		setter: 'assist config set restructure.ignore "src/generated/**"',
		note: "globs excluded from restructure coupling analysis",
	},
];
