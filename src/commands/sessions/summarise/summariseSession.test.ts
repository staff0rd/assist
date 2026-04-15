import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", () => ({
	execFileSync: vi.fn(),
}));

vi.mock("./extractFirstUserMessage", () => ({
	extractFirstUserMessage: vi.fn(),
}));

vi.mock("./scanSessionBacklogRefs", () => ({
	scanSessionBacklogRefs: vi.fn(),
}));

import { extractFirstUserMessage } from "./extractFirstUserMessage";
import { scanSessionBacklogRefs } from "./scanSessionBacklogRefs";
import { summariseSession } from "./summariseSession";

const mockExecFileSync = execFileSync as unknown as ReturnType<typeof vi.fn>;
const mockExtract = extractFirstUserMessage as unknown as ReturnType<
	typeof vi.fn
>;
const mockScan = scanSessionBacklogRefs as unknown as ReturnType<typeof vi.fn>;

describe("summariseSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns undefined when no first message and no backlog refs", () => {
		mockExtract.mockReturnValue(undefined);
		mockScan.mockReturnValue([]);

		expect(summariseSession("/s.jsonl")).toBeUndefined();
		expect(mockExecFileSync).not.toHaveBeenCalled();
	});

	it("calls claude -p with the built prompt", () => {
		mockExtract.mockReturnValue("Add retry logic");
		mockScan.mockReturnValue([42]);
		mockExecFileSync.mockReturnValue("Backlog #42 — add retry logic");

		const result = summariseSession("/s.jsonl");

		expect(result).toBe("Backlog #42 — add retry logic");
		expect(mockExecFileSync).toHaveBeenCalledWith(
			"claude",
			expect.arrayContaining(["-p", "--model", "haiku"]),
			expect.objectContaining({ encoding: "utf8", timeout: 30_000 }),
		);
	});

	it("includes backlog refs in prompt", () => {
		mockExtract.mockReturnValue("Working on items");
		mockScan.mockReturnValue([10, 20]);
		mockExecFileSync.mockReturnValue("Backlog #10, #20 — update config");

		summariseSession("/s.jsonl");

		const prompt = mockExecFileSync.mock.calls[0][1].at(-1) as string;
		expect(prompt).toContain("#10, #20");
	});

	it("works with only backlog refs and no first message", () => {
		mockExtract.mockReturnValue(undefined);
		mockScan.mockReturnValue([5]);
		mockExecFileSync.mockReturnValue("Backlog #5 — fix bug");

		expect(summariseSession("/s.jsonl")).toBe("Backlog #5 — fix bug");
	});

	it("works with only first message and no backlog refs", () => {
		mockExtract.mockReturnValue("Fix the login page");
		mockScan.mockReturnValue([]);
		mockExecFileSync.mockReturnValue("Fix login page styling");

		expect(summariseSession("/s.jsonl")).toBe("Fix login page styling");
	});

	it("strips wrapping quotes from LLM output", () => {
		mockExtract.mockReturnValue("test");
		mockScan.mockReturnValue([]);
		mockExecFileSync.mockReturnValue('"Fix login page"');

		expect(summariseSession("/s.jsonl")).toBe("Fix login page");
	});

	it("takes only the first line of multi-line output", () => {
		mockExtract.mockReturnValue("test");
		mockScan.mockReturnValue([]);
		mockExecFileSync.mockReturnValue("Summary line\nExtra explanation");

		expect(summariseSession("/s.jsonl")).toBe("Summary line");
	});

	it("returns undefined when claude fails", () => {
		mockExtract.mockReturnValue("test");
		mockScan.mockReturnValue([]);
		mockExecFileSync.mockImplementation(() => {
			throw new Error("timeout");
		});

		expect(summariseSession("/s.jsonl")).toBeUndefined();
	});

	it("returns undefined when claude returns empty output", () => {
		mockExtract.mockReturnValue("test");
		mockScan.mockReturnValue([]);
		mockExecFileSync.mockReturnValue("  \n  ");

		expect(summariseSession("/s.jsonl")).toBeUndefined();
	});
});
