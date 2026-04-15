import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./iterateUserMessages", () => ({
	iterateUserMessages: vi.fn(),
}));

import { extractFirstUserMessage } from "./extractFirstUserMessage";
import { iterateUserMessages } from "./iterateUserMessages";

const mockIterate = iterateUserMessages as unknown as ReturnType<typeof vi.fn>;

function* yieldMessages(...messages: string[]) {
	for (const m of messages) yield m;
}

describe("extractFirstUserMessage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns undefined when no user messages", () => {
		mockIterate.mockReturnValue(yieldMessages());

		expect(extractFirstUserMessage("/s.jsonl")).toBeUndefined();
	});

	it("returns the first user message", () => {
		mockIterate.mockReturnValue(yieldMessages("Hello world", "Second"));

		expect(extractFirstUserMessage("/s.jsonl")).toBe("Hello world");
	});

	it("truncates long messages to 500 chars", () => {
		const longText = "x".repeat(600);
		mockIterate.mockReturnValue(yieldMessages(longText));

		const result = extractFirstUserMessage("/s.jsonl");
		expect(result).toHaveLength(501); // 500 + "…"
		expect(result?.endsWith("…")).toBe(true);
	});

	it("trims whitespace from messages", () => {
		mockIterate.mockReturnValue(yieldMessages("  padded text  "));

		expect(extractFirstUserMessage("/s.jsonl")).toBe("padded text");
	});
});
