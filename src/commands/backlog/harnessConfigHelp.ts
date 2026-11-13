import type { ConfigHelpEntry } from "../../shared/configHelp";

export const harnessConfigHelp: ConfigHelpEntry[] = [
	{
		key: "harness.engine",
		setter: "assist config set harness.engine <claude|claude-sdk|codex|pi>",
		note: "default coding harness launched by refine and other flows; claude-sdk (Claude (SDK)) drives your logged-in claude through the Agent SDK, and signed in with a Claude plan its usage draws from the same plan usage limits as Claude Code (Anthropic's monthly API credits cover the Agent SDK only with an API key)",
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
		note: "a value routes non-review Codex launches through the LiteLLM proxy with that model (needs litellm.baseUrl and litellm.apiKey); unset, empty or codex-default uses codex's own configured provider and model, and codex-default overrides a value inherited from user or global config",
	},
];
