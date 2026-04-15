import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./iterateUserMessages", () => ({
	iterateUserMessages: vi.fn(),
}));

import { iterateUserMessages } from "./iterateUserMessages";
import { scanSessionBacklogRefs } from "./scanSessionBacklogRefs";

const mockIterate = iterateUserMessages as unknown as ReturnType<typeof vi.fn>;

function* yieldMessages(...messages: string[]) {
	for (const m of messages) yield m;
}

describe("scanSessionBacklogRefs", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns empty array when no messages", () => {
		mockIterate.mockReturnValue(yieldMessages());

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([]);
	});

	it("detects 'backlog run 42'", () => {
		mockIterate.mockReturnValue(yieldMessages("assist backlog run 42"));

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([42]);
	});

	it("detects 'backlog run 42 1' (with phase)", () => {
		mockIterate.mockReturnValue(yieldMessages("assist backlog run 42 1"));

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([42]);
	});

	it("detects 'backlog phase-done 87 1'", () => {
		mockIterate.mockReturnValue(
			yieldMessages('assist backlog phase-done 87 1 "done"'),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([87]);
	});

	it("detects 'backlog comment 87'", () => {
		mockIterate.mockReturnValue(
			yieldMessages('assist backlog comment 87 "text"'),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([87]);
	});

	it("detects standalone #42 reference", () => {
		mockIterate.mockReturnValue(
			yieldMessages("Implementing backlog #42 — add retry logic"),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([42]);
	});

	it("detects 'backlog item #10'", () => {
		mockIterate.mockReturnValue(yieldMessages("Working on backlog item #10"));

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([10]);
	});

	it("detects 'backlog #10'", () => {
		mockIterate.mockReturnValue(
			yieldMessages("This relates to backlog #10 and backlog #20"),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([10, 20]);
	});

	it("deduplicates IDs across messages", () => {
		mockIterate.mockReturnValue(
			yieldMessages("backlog run 42", "working on #42 still"),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([42]);
	});

	it("returns sorted IDs", () => {
		mockIterate.mockReturnValue(
			yieldMessages("backlog run 99", "backlog run 3", "backlog run 50"),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([3, 50, 99]);
	});

	it("reads the full file for backlog scanning", () => {
		mockIterate.mockReturnValue(yieldMessages("backlog run 5"));

		scanSessionBacklogRefs("/s.jsonl");

		expect(mockIterate).toHaveBeenCalledWith(
			"/s.jsonl",
			Number.MAX_SAFE_INTEGER,
		);
	});
});
