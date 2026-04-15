import { closeSync, openSync, readSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
	openSync: vi.fn(),
	readSync: vi.fn(),
	closeSync: vi.fn(),
}));

import { iterateUserMessages } from "./iterateUserMessages";

const mockOpenSync = openSync as unknown as ReturnType<typeof vi.fn>;
const mockReadSync = readSync as unknown as ReturnType<typeof vi.fn>;
const mockCloseSync = closeSync as unknown as ReturnType<typeof vi.fn>;

function userLine(text: string): string {
	return JSON.stringify({
		type: "user",
		message: { role: "user", content: text },
	});
}

function assistantLine(text: string): string {
	return JSON.stringify({
		type: "assistant",
		message: { role: "assistant", content: text },
	});
}

function mockFileContent(content: string) {
	mockOpenSync.mockReturnValue(42);
	mockReadSync.mockImplementation((_fd: number, buf: Buffer) => {
		const bytes = Buffer.from(content, "utf8");
		bytes.copy(buf);
		return bytes.length;
	});
}

function collect(filePath: string, maxBytes?: number): string[] {
	return [...iterateUserMessages(filePath, maxBytes)];
}

describe("iterateUserMessages", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("yields nothing for unreadable file", () => {
		mockOpenSync.mockImplementation(() => {
			throw new Error("ENOENT");
		});

		expect(collect("/missing.jsonl")).toEqual([]);
	});

	it("yields nothing for empty file", () => {
		mockFileContent("");

		expect(collect("/empty.jsonl")).toEqual([]);
	});

	it("yields user messages in order", () => {
		mockFileContent([userLine("first"), userLine("second")].join("\n"));

		expect(collect("/s.jsonl")).toEqual(["first", "second"]);
	});

	it("skips assistant messages", () => {
		mockFileContent([assistantLine("assistant"), userLine("user")].join("\n"));

		expect(collect("/s.jsonl")).toEqual(["user"]);
	});

	it("skips malformed JSON lines", () => {
		mockFileContent(["not json", userLine("valid")].join("\n"));

		expect(collect("/s.jsonl")).toEqual(["valid"]);
	});

	it("handles array content format", () => {
		const entry = JSON.stringify({
			type: "user",
			message: {
				role: "user",
				content: [{ type: "text", text: "array text" }],
			},
		});
		mockFileContent(entry);

		expect(collect("/s.jsonl")).toEqual(["array text"]);
	});

	it("closes the file descriptor after iteration", () => {
		mockFileContent(userLine("test"));

		collect("/s.jsonl");

		expect(mockCloseSync).toHaveBeenCalledWith(42);
	});

	it("skips meta entries", () => {
		const meta = JSON.stringify({
			sessionId: "abc",
			type: "summary",
			isMeta: true,
		});
		mockFileContent([meta, userLine("hello")].join("\n"));

		expect(collect("/s.jsonl")).toEqual(["hello"]);
	});
});
