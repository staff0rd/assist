import type { Command } from "commander";
import {
	adviceFragments,
	blockCodeComments,
	configKeys,
	forbiddenStrings,
	hardcodedColors,
	migrations,
	noVenv,
} from "./verify";

const checks = [
	{
		name: "hardcoded-colors",
		description: "Check for hardcoded hex colors in src/",
		action: hardcodedColors,
	},
	{
		name: "block-code-comments",
		description:
			"Fail on any comment on a changed line, whether added or edited",
		action: blockCodeComments,
	},
	{
		name: "no-venv",
		description: "Check that no venv folders exist in the repo",
		action: noVenv,
	},
	{
		name: "forbidden-strings",
		description:
			"Check configured JSON files for values matching forbiddenStrings rules",
		action: forbiddenStrings,
	},
	{
		name: "config-keys",
		description:
			"Check every assistConfigSchema key is surfaced in some command's --help via configHelp",
		action: configKeys,
	},
	{
		name: "advice-fragments",
		description:
			"Check ADVICE_FRAGMENT_NAMES matches the fragments shipped in claude/advice, so advice.include/exclude can name every one",
		action: adviceFragments,
	},
	{
		name: "migrations",
		description:
			"Check DB migrations are sequentially numbered, append-only, and gate destructive DDL behind an acknowledgement marker",
		action: migrations,
	},
];

export function registerVerifyChecks(verifyCommand: Command): void {
	for (const check of checks) {
		verifyCommand
			.command(check.name)
			.description(check.description)
			.action(check.action);
	}
}
