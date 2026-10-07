import { describe, expect, it } from "vitest";
import { buildCiReviewerModels } from "./buildCiReviewerModels";
import { deriveEndpoints } from "./deriveEndpoints";
import type { ReviewCiConfig } from "./readReviewCiEnv";

const config: ReviewCiConfig = {
	provider: "litellm",
	baseUrl: "https://proxy.example",
	slots: {
		claude: { harness: "claude", model: "claude-sonnet" },
		codex: { harness: "codex", model: "gpt-codex" },
		synthesis: { harness: "claude", model: "claude-sonnet" },
	},
	auth: { kind: "key", apiKey: "sk-test" },
};

function build(overrides: Partial<ReviewCiConfig>) {
	const merged = { ...config, ...overrides };
	return buildCiReviewerModels(
		merged,
		deriveEndpoints(merged.provider, merged.baseUrl),
		"sk-test",
	);
}

describe("buildCiReviewerModels", () => {
	const models = build({});

	it("points a Claude slot at the provider's Anthropic endpoint with its model", () => {
		expect(models.claude.harness).toBe("claude");
		expect(models.claude.override.args).toEqual(["--model", "claude-sonnet"]);
		expect(models.claude.override.env).toMatchObject({
			ANTHROPIC_BASE_URL: "https://proxy.example",
			ANTHROPIC_AUTH_TOKEN: "sk-test",
			ANTHROPIC_DEFAULT_HAIKU_MODEL: "claude-sonnet",
		});
	});

	it("points a Codex slot at the provider's Responses endpoint with its model", () => {
		expect(models.codex.harness).toBe("codex");
		expect(models.codex.override.args).toContain(
			"model_providers.litellm.base_url=https://proxy.example/v1",
		);
		expect(models.codex.override.args.slice(-2)).toEqual(["-m", "gpt-codex"]);
		expect(Object.values(models.codex.override.env)).toEqual(["sk-test"]);
	});

	it("runs every slot on Codex when each names codex", () => {
		const allCodex = build({
			slots: {
				claude: { harness: "codex", model: "gpt-5.6-terra" },
				codex: { harness: "codex", model: "gpt-5.4" },
				synthesis: { harness: "codex", model: "gpt-5.6-terra" },
			},
		});
		expect(
			Object.values(allCodex).map((slot) => [
				slot.label,
				slot.harness,
				slot.override.model,
			]),
		).toEqual([
			["reviewer-1", "codex", "gpt-5.6-terra"],
			["reviewer-2", "codex", "gpt-5.4"],
			["synthesis", "codex", "gpt-5.6-terra"],
		]);
	});
});

describe("buildCiReviewerModels with foundry", () => {
	const foundry = {
		provider: "foundry",
		baseUrl: "https://res.services.ai.azure.com",
	};

	it("runs Claude Code in Foundry mode with an API key", () => {
		const models = build(foundry);
		expect(models.claude.override.env).toMatchObject({
			CLAUDE_CODE_USE_FOUNDRY: "1",
			ANTHROPIC_FOUNDRY_BASE_URL: "https://res.services.ai.azure.com/anthropic",
			ANTHROPIC_FOUNDRY_API_KEY: "sk-test",
		});
		expect(models.claude.override.env).not.toHaveProperty(
			"ANTHROPIC_AUTH_TOKEN",
		);
	});

	it("sends an Entra token to the Anthropic endpoint as a Bearer token", () => {
		const models = build({
			...foundry,
			auth: { kind: "entra", clientId: "client", tenantId: "tenant" },
		});
		expect(models.claude.override.env).toMatchObject({
			ANTHROPIC_BASE_URL: "https://res.services.ai.azure.com/anthropic",
			ANTHROPIC_AUTH_TOKEN: "sk-test",
		});
		expect(models.claude.override.env).not.toHaveProperty(
			"CLAUDE_CODE_USE_FOUNDRY",
		);
	});

	it("points Codex at the resource's OpenAI v1 endpoint", () => {
		expect(build(foundry).codex.override.args).toContain(
			"model_providers.litellm.base_url=https://res.services.ai.azure.com/openai/v1",
		);
	});
});
