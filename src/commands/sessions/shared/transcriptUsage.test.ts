import { describe, expect, it } from "vitest";
import { transcriptUsage } from "./transcriptUsage";

const assistant = (id: string, usage: Record<string, number>): string =>
	JSON.stringify({ type: "assistant", message: { id, usage } });

describe("transcriptUsage", () => {
	it("sums output/input tokens per assistant response", () => {
		const lines = [
			assistant("msg_a", { input_tokens: 100, output_tokens: 20 }),
			assistant("msg_b", { input_tokens: 50, output_tokens: 10 }),
		];

		expect(transcriptUsage(lines)).toEqual([
			{ messageId: "msg_a", inputTokens: 100, outputTokens: 20 },
			{ messageId: "msg_b", inputTokens: 50, outputTokens: 10 },
		]);
	});

	it("dedups repeated lines for the same message.id", () => {
		const line = assistant("msg_a", { input_tokens: 100, output_tokens: 20 });

		expect(transcriptUsage([line, line, line])).toEqual([
			{ messageId: "msg_a", inputTokens: 100, outputTokens: 20 },
		]);
	});

	it("ignores cached token fields, counting only input/output", () => {
		const line = assistant("msg_a", {
			input_tokens: 100,
			output_tokens: 20,
			cache_creation_input_tokens: 9000,
			cache_read_input_tokens: 8000,
		});

		expect(transcriptUsage([line])).toEqual([
			{ messageId: "msg_a", inputTokens: 100, outputTokens: 20 },
		]);
	});

	it("skips user lines, blank lines, and malformed JSON", () => {
		const lines = [
			"",
			"   ",
			"{ not json",
			JSON.stringify({ type: "user", message: { content: "hi" } }),
			assistant("msg_a", { input_tokens: 5, output_tokens: 1 }),
		];

		expect(transcriptUsage(lines)).toEqual([
			{ messageId: "msg_a", inputTokens: 5, outputTokens: 1 },
		]);
	});

	it("skips assistant lines with no message.id or usage", () => {
		const lines = [
			JSON.stringify({ type: "assistant", message: { usage: {} } }),
			JSON.stringify({ type: "assistant", message: { id: "msg_a" } }),
		];

		expect(transcriptUsage(lines)).toEqual([]);
	});

	it("defaults missing token counts to zero", () => {
		expect(transcriptUsage([assistant("msg_a", {})])).toEqual([
			{ messageId: "msg_a", inputTokens: 0, outputTokens: 0 },
		]);
	});
});
