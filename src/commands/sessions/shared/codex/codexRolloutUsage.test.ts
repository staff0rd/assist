import { describe, expect, it } from "vitest";
import { codexRolloutUsage } from "./codexRolloutUsage";

const meta = JSON.stringify({
	type: "session_meta",
	payload: { session_id: "conv-1" },
});

function tokenCount(
	total: number,
	last: Record<string, number>,
	rateLimits: unknown = null,
): string {
	return JSON.stringify({
		type: "event_msg",
		payload: {
			type: "token_count",
			info: {
				total_token_usage: { total_tokens: total },
				last_token_usage: last,
				model_context_window: 200_000,
			},
			rate_limits: rateLimits,
		},
	});
}

describe("codexRolloutUsage", () => {
	it("turns each token_count into a response keyed by conversation and running total", () => {
		const usage = codexRolloutUsage([
			meta,
			tokenCount(1000, {
				input_tokens: 900,
				cached_input_tokens: 400,
				output_tokens: 100,
				total_tokens: 1000,
			}),
			tokenCount(3000, {
				input_tokens: 1800,
				cached_input_tokens: 800,
				output_tokens: 200,
				total_tokens: 2000,
			}),
		]);

		expect(usage.responses).toEqual([
			{ messageId: "codex:conv-1:1000", inputTokens: 500, outputTokens: 100 },
			{
				messageId: "codex:conv-1:3000",
				inputTokens: 1000,
				outputTokens: 200,
			},
		]);
		expect(usage.usedPct).toBe(1);
	});

	it("collapses a repeated token_count for the same running total", () => {
		const last = { input_tokens: 10, output_tokens: 5, total_tokens: 15 };
		const usage = codexRolloutUsage([
			meta,
			tokenCount(15, last),
			tokenCount(15, last),
		]);

		expect(usage.responses).toHaveLength(1);
	});

	it("maps Codex windows onto the 5h/7d buckets by their length", () => {
		const usage = codexRolloutUsage([
			meta,
			tokenCount(
				15,
				{ output_tokens: 5, total_tokens: 15 },
				{
					primary: { used_percent: 12, window_minutes: 300, resets_at: 111 },
					secondary: {
						used_percent: 40,
						window_minutes: 10080,
						resets_at: 222,
					},
				},
			),
		]);

		expect(usage.rateLimits).toEqual({
			five_hour: { used_percentage: 12, resets_at: 111 },
			seven_day: { used_percentage: 40, resets_at: 222 },
		});
	});

	it("keeps the last known limits when a later event carries none", () => {
		const usage = codexRolloutUsage([
			tokenCount(
				15,
				{ total_tokens: 15 },
				{
					primary: { used_percent: 3, window_minutes: 10080, resets_at: 9 },
					secondary: null,
				},
			),
			tokenCount(30, { total_tokens: 15 }),
		]);

		expect(usage.rateLimits).toEqual({
			seven_day: { used_percentage: 3, resets_at: 9 },
		});
	});

	it("ignores windows of an unrecognised length and events without info", () => {
		const usage = codexRolloutUsage([
			JSON.stringify({
				type: "event_msg",
				payload: {
					type: "token_count",
					info: null,
					rate_limits: {
						primary: { used_percent: 3, window_minutes: 60, resets_at: 9 },
					},
				},
			}),
		]);

		expect(usage).toEqual({ responses: [] });
	});
});
