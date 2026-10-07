import {
	buildCodexProviderArgs,
	type CodexModelOverride,
} from "../../litellm/buildCodexProviderArgs";
import type { ReviewerModels, SlotModel } from "../ReviewerModels";
import type { ReviewCiEndpoints } from "./deriveEndpoints";
import type { ReviewCiSlot } from "./parseSlot";
import type { ReviewCiConfig } from "./readReviewCiEnv";

function pinEveryClaudeModelAlias(model: string): Record<string, string> {
	return {
		ANTHROPIC_DEFAULT_OPUS_MODEL: model,
		ANTHROPIC_DEFAULT_SONNET_MODEL: model,
		ANTHROPIC_DEFAULT_HAIKU_MODEL: model,
		CLAUDE_CODE_SUBAGENT_MODEL: model,
	};
}

function claudeProviderEnv(
	endpoints: ReviewCiEndpoints,
	config: ReviewCiConfig,
	token: string,
): Record<string, string> {
	if (endpoints.anthropicKind === "foundry" && config.auth.kind === "key")
		return {
			CLAUDE_CODE_USE_FOUNDRY: "1",
			ANTHROPIC_FOUNDRY_BASE_URL: endpoints.anthropic,
			ANTHROPIC_FOUNDRY_API_KEY: token,
		};
	return {
		ANTHROPIC_BASE_URL: endpoints.anthropic,
		ANTHROPIC_AUTH_TOKEN: token,
	};
}

function buildOverride(
	slot: ReviewCiSlot,
	config: ReviewCiConfig,
	endpoints: ReviewCiEndpoints,
	token: string,
): CodexModelOverride {
	if (slot.harness === "codex")
		return buildCodexProviderArgs(endpoints.responses, token, slot.model);
	return {
		args: ["--model", slot.model],
		env: {
			...claudeProviderEnv(endpoints, config, token),
			CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
			...pinEveryClaudeModelAlias(slot.model),
		},
		model: slot.model,
	};
}

export function buildCiReviewerModels(
	config: ReviewCiConfig,
	endpoints: ReviewCiEndpoints,
	token: string,
): Required<ReviewerModels> {
	const slotModel = (slot: ReviewCiSlot, label: string): SlotModel => ({
		harness: slot.harness,
		label,
		override: buildOverride(slot, config, endpoints, token),
	});
	return {
		claude: slotModel(config.slots.claude, "reviewer-1"),
		codex: slotModel(config.slots.codex, "reviewer-2"),
		synthesis: slotModel(config.slots.synthesis, "synthesis"),
	};
}
