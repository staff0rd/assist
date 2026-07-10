import type { ConfigHelpEntry } from "../../shared/configHelp";

export const complexityConfigHelp: ConfigHelpEntry[] = [
	{
		key: "complexity.ignore",
		setter: 'assist config set complexity.ignore "**/*test.ts*"',
		note: "globs excluded from maintainability (default: **/*test.ts*)",
	},
];
