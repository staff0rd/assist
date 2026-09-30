import { describe, expect, it } from "vitest";
import { buildCiReviewerModels } from "./buildCiReviewerModels";
import { deriveEndpoints } from "./deriveEndpoints";

const config = {
	provider: "litellm",
	baseUrl: "https://proxy.example",
	claudeModel: "claude-sonnet",
	codexModel: "gpt-codex",
	apiKey: "sk-test",
};

describe("buildCiReviewerModels", () => {
	const models = buildCiReviewerModels(
		config,
		deriveEndpoints(config.provider, config.baseUrl),
	);

	it("points Claude at the provider's Anthropic endpoint with the configured model", () => {
		expect(models.claude?.args).toEqual(["--model", "claude-sonnet"]);
		expect(models.claude?.env).toMatchObject({
			ANTHROPIC_BASE_URL: "https://proxy.example",
			ANTHROPIC_AUTH_TOKEN: "sk-test",
			ANTHROPIC_DEFAULT_HAIKU_MODEL: "claude-sonnet",
		});
	});

	it("points Codex at the provider's Responses endpoint with the configured model", () => {
		expect(models.codex?.args).toContain(
			"model_providers.litellm.base_url=https://proxy.example/v1",
		);
		expect(models.codex?.args.slice(-2)).toEqual(["-m", "gpt-codex"]);
		expect(Object.values(models.codex?.env ?? {})).toEqual(["sk-test"]);
	});
});

describe("buildCiReviewerModels with foundry", () => {
	const foundry = {
		...config,
		provider: "foundry",
		baseUrl: "https://res.services.ai.azure.com",
	};
	const models = buildCiReviewerModels(
		foundry,
		deriveEndpoints(foundry.provider, foundry.baseUrl),
	);

	it("runs Claude Code in Foundry mode against the resource's Anthropic endpoint", () => {
		expect(models.claude?.env).toMatchObject({
			CLAUDE_CODE_USE_FOUNDRY: "1",
			ANTHROPIC_FOUNDRY_BASE_URL: "https://res.services.ai.azure.com/anthropic",
			ANTHROPIC_FOUNDRY_API_KEY: "sk-test",
		});
		expect(models.claude?.env).not.toHaveProperty("ANTHROPIC_AUTH_TOKEN");
	});

	it("points Codex at the resource's OpenAI v1 endpoint", () => {
		expect(models.codex?.args).toContain(
			"model_providers.litellm.base_url=https://res.services.ai.azure.com/openai/v1",
		);
	});
});
