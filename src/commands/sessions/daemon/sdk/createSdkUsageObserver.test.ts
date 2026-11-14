import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSdkUsageObserver } from "./createSdkUsageObserver";
import { setSdkUsageSink } from "./sdkUsageSink";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../shared/findSessionJsonlPath", () => ({
	findSessionJsonlPath: vi.fn(async () => "/t/abc.jsonl"),
}));

const sink = { limits: vi.fn(), usage: vi.fn() };

const message = (m: unknown) => m as SDKMessage;

describe("createSdkUsageObserver", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setSdkUsageSink(sink);
	});

	it("records rate-limit events on the Claude account", () => {
		createSdkUsageObserver("session 1")(
			message({
				type: "rate_limit_event",
				rate_limit_info: {
					status: "allowed",
					rateLimitType: "five_hour",
					utilization: 0.5,
					resetsAt: 10,
				},
			}),
		);
		expect(sink.limits).toHaveBeenCalledWith({
			five_hour: { used_percentage: 50, resets_at: 10 },
		});
	});

	it("records the turn's usage against the claude session with its transcript", async () => {
		const observe = createSdkUsageObserver("session 1");
		observe(
			message({
				type: "assistant",
				parent_tool_use_id: null,
				message: {
					model: "opus",
					content: [],
					usage: { input_tokens: 40_000, cache_read_input_tokens: 10_000 },
				},
			}),
		);
		observe(
			message({
				type: "result",
				session_id: "abc",
				modelUsage: { opus: { contextWindow: 200_000 } },
			}),
		);
		await vi.waitFor(() =>
			expect(sink.usage).toHaveBeenCalledWith("abc", "/t/abc.jsonl", 25),
		);
	});

	it("ignores subagent calls when measuring context", async () => {
		const observe = createSdkUsageObserver("session 1");
		observe(
			message({
				type: "assistant",
				parent_tool_use_id: "tool-1",
				message: { model: "opus", content: [], usage: { input_tokens: 1 } },
			}),
		);
		observe(
			message({
				type: "result",
				session_id: "abc",
				modelUsage: { opus: { contextWindow: 200_000 } },
			}),
		);
		await vi.waitFor(() =>
			expect(sink.usage).toHaveBeenCalledWith("abc", "/t/abc.jsonl", undefined),
		);
	});

	it("refreshes context % from the query after each main-loop response", async () => {
		const observe = createSdkUsageObserver("session 1", async () => 41.6);
		observe(
			message({
				type: "assistant",
				parent_tool_use_id: null,
				session_id: "abc",
				message: { model: "opus", content: [], usage: { input_tokens: 10 } },
			}),
		);
		await vi.waitFor(() =>
			expect(sink.usage).toHaveBeenCalledWith("abc", undefined, 42),
		);
		observe(
			message({
				type: "result",
				session_id: "abc",
				modelUsage: { opus: { contextWindow: 200_000 } },
			}),
		);
		await vi.waitFor(() =>
			expect(sink.usage).toHaveBeenCalledWith("abc", "/t/abc.jsonl", 42),
		);
	});
});
