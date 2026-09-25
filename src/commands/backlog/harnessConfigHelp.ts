import type { ConfigHelpEntry } from "../../shared/configHelp";

export const harnessConfigHelp: ConfigHelpEntry[] = [
	{
		key: "harness.engine",
		setter: "assist config set harness.engine <claude|codex|pi>",
		note: "default coding harness launched by refine and other flows",
	},
	{
		key: "harness.exposeCodexActions",
		setter: "assist config set harness.exposeCodexActions <true|false>",
		note: "force the web UI 'with Codex' actions off even when codex is on PATH",
	},
	{
		key: "harness.exposePiActions",
		setter: "assist config set harness.exposePiActions <true|false>",
		note: "force the web UI 'with pi' actions off even when pi is on PATH",
	},
	{
		key: "harness.codexModel",
		setter: "assist config set harness.codexModel <model>",
		note: "run non-review Codex launches against this model on the LiteLLM proxy; plain codex when LiteLLM is unconfigured",
	},
];
