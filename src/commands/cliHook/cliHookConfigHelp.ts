import type { ConfigHelpEntry } from "../../shared/configHelp";

export const cliHookConfigHelp: ConfigHelpEntry[] = [
	{
		key: "cliReadVerbs",
		setter: 'assist config set cliReadVerbs.git "status"',
		note: "extra per-CLI verbs treated as read-only for auto-approval",
	},
	{
		key: "cliHook.blockNpmRun",
		setter: "assist config set cliHook.blockNpmRun false",
		note: "when true (default), the hook denies 'npm run' and redirects to 'assist run'",
	},
];
