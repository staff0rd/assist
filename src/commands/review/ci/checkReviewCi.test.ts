import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkReviewCi } from "./checkReviewCi";

const fullEnv = {
	REVIEW_CI_PROVIDER: "litellm",
	REVIEW_CI_BASE_URL: "https://proxy.example/",
	REVIEW_CI_REVIEWER_1: "claude:claude-sonnet",
	REVIEW_CI_REVIEWER_2: "codex:gpt-codex",
	REVIEW_CI_SYNTHESIS: "claude:claude-sonnet",
	REVIEW_CI_API_KEY: "sk-test",
};

const foundryEntraEnv = {
	REVIEW_CI_PROVIDER: "foundry",
	REVIEW_CI_BASE_URL: "https://res.services.ai.azure.com",
	REVIEW_CI_REVIEWER_1: "codex:gpt-5.6-terra",
	REVIEW_CI_REVIEWER_2: "codex:gpt-5.4",
	REVIEW_CI_SYNTHESIS: "codex:gpt-5.6-terra",
	REVIEW_CI_AZURE_CLIENT_ID: "client-id",
	REVIEW_CI_AZURE_TENANT_ID: "tenant-id",
	GITHUB_ACTIONS: "true",
	ACTIONS_ID_TOKEN_REQUEST_URL: "https://oidc.example/token?api-version=2.0",
	ACTIONS_ID_TOKEN_REQUEST_TOKEN: "request-token",
};

type Call = { url: string; init: RequestInit & { headers?: object } };

describe("checkReviewCi", () => {
	const fetchMock = vi.fn();
	const calls = (): Call[] =>
		fetchMock.mock.calls.map(([url, init]) => ({ url: String(url), init }));

	beforeEach(() => {
		vi.stubGlobal("fetch", fetchMock);
		vi.spyOn(console, "log").mockImplementation(() => {});
		fetchMock.mockImplementation(async () => new Response("{}"));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		fetchMock.mockReset();
	});

	it("names every unset variable and the secret without making a request", async () => {
		const errors = await checkReviewCi({
			REVIEW_CI_PROVIDER: "litellm",
			REVIEW_CI_REVIEWER_2: " ",
		});

		expect(errors).toEqual([
			"REVIEW_CI_BASE_URL is not set",
			"REVIEW_CI_REVIEWER_1 is not set",
			"REVIEW_CI_REVIEWER_2 is not set",
			"REVIEW_CI_SYNTHESIS is not set",
			"REVIEW_CI_API_KEY is not set",
		]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("asks for the tenant instead of the key when foundry has a client ID", async () => {
		const errors = await checkReviewCi({
			...foundryEntraEnv,
			REVIEW_CI_AZURE_TENANT_ID: "",
		});

		expect(errors).toEqual(["REVIEW_CI_AZURE_TENANT_ID is not set"]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("names each slot that is not harness:model", async () => {
		const errors = await checkReviewCi({
			...fullEnv,
			REVIEW_CI_REVIEWER_1: "gpt-5.4",
			REVIEW_CI_SYNTHESIS: "pi:gpt-5.4",
		});

		expect(errors).toEqual([
			'REVIEW_CI_REVIEWER_1 "gpt-5.4" must be claude:<model> or codex:<model>',
			'REVIEW_CI_SYNTHESIS "pi:gpt-5.4" must be claude:<model> or codex:<model>',
		]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("rejects an unsupported provider without making a request", async () => {
		const errors = await checkReviewCi({
			...fullEnv,
			REVIEW_CI_PROVIDER: "bedrock",
		});

		expect(errors).toEqual([
			'Unsupported REVIEW_CI_PROVIDER "bedrock" (expected one of: litellm, foundry)',
		]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("sends one request per distinct slot model through the LiteLLM endpoints", async () => {
		expect(await checkReviewCi(fullEnv)).toEqual([]);

		expect(
			calls().map(({ url, init }) => ({
				url,
				body: JSON.parse(String(init.body)),
				auth: (init.headers as Record<string, string>).Authorization,
			})),
		).toEqual([
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

	it("sends a Foundry key alone to the Anthropic endpoint", async () => {
		expect(
			await checkReviewCi({
				...fullEnv,
				REVIEW_CI_PROVIDER: "foundry",
				REVIEW_CI_BASE_URL: "https://res.services.ai.azure.com/",
			}),
		).toEqual([]);

		expect(
			calls().map(({ url, init }) => {
				const headers = init.headers as Record<string, string>;
				return {
					url,
					auth: headers.Authorization,
					apiKey: headers["x-api-key"],
				};
			}),
		).toEqual([
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

	it("exchanges the GitHub OIDC token for an Entra token and probes with it", async () => {
		fetchMock
			.mockResolvedValueOnce(Response.json({ value: "github-jwt" }))
			.mockResolvedValueOnce(Response.json({ access_token: "entra-token" }));

		expect(await checkReviewCi(foundryEntraEnv)).toEqual([]);

		const [oidc, entra, ...probes] = calls();
		expect(oidc.url).toBe(
			"https://oidc.example/token?api-version=2.0&audience=api%3A%2F%2FAzureADTokenExchange",
		);
		expect(entra.url).toBe(
			"https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token",
		);
		expect(
			Object.fromEntries(entra.init.body as URLSearchParams),
		).toMatchObject({
			client_id: "client-id",
			client_assertion: "github-jwt",
			scope: "https://cognitiveservices.azure.com/.default",
		});
		expect(
			probes.map(({ url, init }) => ({
				url,
				model: JSON.parse(String(init.body)).model,
				auth: (init.headers as Record<string, string>).Authorization,
			})),
		).toEqual([
			{
				url: "https://res.services.ai.azure.com/openai/v1/responses",
				model: "gpt-5.6-terra",
				auth: "Bearer entra-token",
			},
			{
				url: "https://res.services.ai.azure.com/openai/v1/responses",
				model: "gpt-5.4",
				auth: "Bearer entra-token",
			},
		]);
	});

	it("names the failed exchange without probing any model", async () => {
		fetchMock
			.mockResolvedValueOnce(Response.json({ value: "github-jwt" }))
			.mockResolvedValueOnce(
				new Response("AADSTS70021: No matching federated identity record", {
					status: 400,
				}),
			);

		expect(await checkReviewCi(foundryEntraEnv)).toEqual([
			"Entra token exchange for client client-id failed: HTTP 400: AADSTS70021: No matching federated identity record",
		]);
		expect(fetchMock).toHaveBeenCalledTimes(2);
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
