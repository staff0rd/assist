import type { ConfigHelpEntry } from "../../shared/configHelp";

export const verifyConfigHelp: ConfigHelpEntry[] = [
	{
		key: "blockComments.ignore",
		setter: 'assist config set blockComments.ignore "**/*.test.ts"',
		note: "globs exempt from the block-comments check",
	},
	{
		key: "hardcodedColors.ignore",
		setter: 'assist config set hardcodedColors.ignore "**/theme.ts"',
		note: "globs exempt from the hardcoded-colors check",
	},
	{
		key: "forbiddenStrings",
		setter: 'assist config set forbiddenStrings.0.disallowed "secret"',
		note: "per-file value rules enforced by the forbidden-strings check",
	},
];
