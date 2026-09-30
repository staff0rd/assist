import { buildCodexProviderArgs } from "../../litellm/buildCodexProviderArgs";
import type { ReviewerModels } from "../ReviewerModels";
import type { ReviewCiEndpoints } from "./deriveEndpoints";
import type { ReviewCiConfig } from "./readReviewCiEnv";

function pinEveryClaudeModelAlias(model: string): Record<string, string> {
	return {
		ANTHROPIC_DEFAULT_OPUS_MODEL: model,
		ANTHROPIC_DEFAULT_SONNET_MODEL: model,
		ANTHROPIC_DEFAULT_HAIKU_MODEL: model,
		CLAUDE_CODE_SUBAGENT_MODEL: model,
	};
}

export function buildCiReviewerModels(
	config: ReviewCiConfig,
	endpoints: ReviewCiEndpoints,
): ReviewerModels {
	const model = config.claudeModel;
	return {
		claude: {
			args: ["--model", model],
			env: {
				ANTHROPIC_BASE_URL: endpoints.anthropic,
				ANTHROPIC_AUTH_TOKEN: config.apiKey,
				CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
				...pinEveryClaudeModelAlias(model),
			},
			model,
		},
		codex: buildCodexProviderArgs(
			endpoints.responses,
			config.apiKey,
			config.codexModel,
		),
	};
}
