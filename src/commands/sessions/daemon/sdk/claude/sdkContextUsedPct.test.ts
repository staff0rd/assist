import type { SDKResultMessage } from "@anthropic-ai/claude-agent-sdk";
import { describe, expect, it } from "vitest";
import { sdkContextTokens, sdkContextUsedPct } from "./sdkContextUsedPct";

const result = (modelUsage: Record<string, { contextWindow: number }>) =>
	({ type: "result", modelUsage }) as unknown as SDKResultMessage;

describe("sdkContextUsedPct", () => {
	it("sums input, cache-read and cache-write tokens of the last call", () => {
		expect(
			sdkContextTokens({
				input_tokens: 2,
				cache_read_input_tokens: 100,
				cache_creation_input_tokens: 98,
			}),
		).toBe(200);
	});

	it("divides by the call's model context window", () => {
		expect(
			sdkContextUsedPct(
				50_000,
				"opus",
				result({
					opus: { contextWindow: 200_000 },
					haiku: { contextWindow: 1 },
				}),
			),
		).toBe(25);
	});

	it("falls back to the largest window when the model is unknown", () => {
		expect(
			sdkContextUsedPct(
				100_000,
				undefined,
				result({
					a: { contextWindow: 200_000 },
					b: { contextWindow: 1_000_000 },
				}),
			),
		).toBe(10);
	});

	it("is undefined without tokens", () => {
		expect(sdkContextUsedPct(0, "opus", result({}))).toBeUndefined();
	});
});
