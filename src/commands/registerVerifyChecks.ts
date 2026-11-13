import type { Command } from "commander";

const checks = [
	{
		name: "hardcoded-colors",
		description: "Check for hardcoded hex colors in src/",
		load: async () =>
			(await import("./verify/hardcodedColors")).hardcodedColors,
	},
	{
		name: "block-code-comments",
		description:
			"Fail on any comment on a changed line, whether added or edited",
		load: async () =>
			(await import("./verify/blockCodeComments")).blockCodeComments,
	},
	{
		name: "no-venv",
		description: "Check that no venv folders exist in the repo",
		load: async () => (await import("./verify/noVenv")).noVenv,
	},
	{
		name: "forbidden-strings",
		description:
			"Check configured JSON files for values matching forbiddenStrings rules",
		load: async () =>
			(await import("./verify/forbiddenStrings")).forbiddenStrings,
	},
	{
		name: "config-keys",
		description:
			"Check every assistConfigSchema key is surfaced in some command's --help via configHelp",
		load: async () => (await import("./verify/configKeys")).configKeys,
	},
	{
		name: "advice-fragments",
		description:
			"Check adviceFragmentNames matches the fragments shipped in agent/advice, so advice.sections can name every one",
		load: async () =>
			(await import("./verify/adviceFragments")).adviceFragments,
	},
	{
		name: "migrations",
		description:
			"Check DB migrations are sequentially numbered, append-only, and gate destructive DDL behind an acknowledgement marker",
		load: async () => (await import("./verify/migrations")).migrations,
	},
	{
		name: "harness-follow-ups",
		description:
			"Check every follow-up item named by an unsupported harness capability exists and is still open",
		load: async () =>
			(await import("./verify/harnessFollowUps")).harnessFollowUps,
	},
];

export function registerVerifyChecks(verifyCommand: Command): void {
	for (const check of checks) {
		verifyCommand
			.command(check.name)
			.description(check.description)
			.action(async () => {
				const action = await check.load();
				await action();
			});
	}
}
