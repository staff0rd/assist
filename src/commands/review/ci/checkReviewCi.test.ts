import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkReviewCi } from "./checkReviewCi";

const fullEnv = {
	ASSIST_REVIEW_PROVIDER: "litellm",
	ASSIST_REVIEW_BASE_URL: "https://proxy.example/",
	ASSIST_REVIEW_CLAUDE_MODEL: "claude-sonnet",
	ASSIST_REVIEW_CODEX_MODEL: "gpt-codex",
	ASSIST_REVIEW_API_KEY: "sk-test",
};

describe("checkReviewCi", () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		vi.stubGlobal("fetch", fetchMock);
		fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		fetchMock.mockReset();
	});

	it("names every unset variable and the secret without making a request", async () => {
		const errors = await checkReviewCi({
			ASSIST_REVIEW_PROVIDER: "litellm",
			ASSIST_REVIEW_CODEX_MODEL: " ",
		});

		expect(errors).toEqual([
			"ASSIST_REVIEW_BASE_URL is not set",
			"ASSIST_REVIEW_CLAUDE_MODEL is not set",
			"ASSIST_REVIEW_CODEX_MODEL is not set",
			"ASSIST_REVIEW_API_KEY is not set",
		]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("rejects an unsupported provider without making a request", async () => {
		const errors = await checkReviewCi({
			...fullEnv,
			ASSIST_REVIEW_PROVIDER: "bedrock",
		});

		expect(errors).toEqual([
			'Unsupported ASSIST_REVIEW_PROVIDER "bedrock" (expected one of: litellm, foundry)',
		]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("sends one request to each model through the LiteLLM endpoints", async () => {
		expect(await checkReviewCi(fullEnv)).toEqual([]);

		const calls = fetchMock.mock.calls.map(([url, init]) => ({
			url,
			body: JSON.parse(init.body),
			auth: init.headers.Authorization,
		}));
		expect(calls).toEqual([
			{
				url: "https://proxy.example/v1/messages",
				body: expect.objectContaining({ model: "claude-sonnet" }),
				auth: "Bearer sk-test",
			},
			{
				url: "https://proxy.example/v1/responses",
				body: expect.objectContaining({ model: "gpt-codex" }),
				auth: "Bearer sk-test",
			},
		]);
	});

	it("sends one request to each model through the Foundry resource endpoints with the key alone for Claude", async () => {
		expect(
			await checkReviewCi({
				...fullEnv,
				ASSIST_REVIEW_PROVIDER: "foundry",
				ASSIST_REVIEW_BASE_URL: "https://res.services.ai.azure.com/",
			}),
		).toEqual([]);

		const calls = fetchMock.mock.calls.map(([url, init]) => ({
			url,
			auth: init.headers.Authorization,
			apiKey: init.headers["x-api-key"],
		}));
		expect(calls).toEqual([
			{
				url: "https://res.services.ai.azure.com/anthropic/v1/messages",
				auth: undefined,
				apiKey: "sk-test",
			},
			{
				url: "https://res.services.ai.azure.com/openai/v1/responses",
				auth: "Bearer sk-test",
				apiKey: undefined,
			},
		]);
	});

	it("names the model, endpoint and error for each failing model", async () => {
		fetchMock
			.mockResolvedValueOnce(new Response("no such model", { status: 404 }))
			.mockRejectedValueOnce(
				new Error("fetch failed", { cause: new Error("ECONNREFUSED") }),
			);

		expect(await checkReviewCi(fullEnv)).toEqual([
			'Claude model "claude-sonnet" at https://proxy.example/v1/messages: HTTP 404: no such model',
			'Codex model "gpt-codex" at https://proxy.example/v1/responses: fetch failed (ECONNREFUSED)',
		]);
	});
});
