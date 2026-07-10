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

	it("detects 'backlog run a42'", () => {
		mockIterate.mockReturnValue(yieldMessages("assist backlog run a42"));

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([42]);
	});

	it("detects 'backlog run a42 1' (with phase)", () => {
		mockIterate.mockReturnValue(yieldMessages("assist backlog run a42 1"));

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([42]);
	});

	it("detects 'backlog phase-done a87 1'", () => {
		mockIterate.mockReturnValue(
			yieldMessages('assist backlog phase-done a87 1 "done"'),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([87]);
	});

	it("detects 'backlog comment a87'", () => {
		mockIterate.mockReturnValue(
			yieldMessages('assist backlog comment a87 "text"'),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([87]);
	});

	it("detects standalone a42 reference", () => {
		mockIterate.mockReturnValue(
			yieldMessages("Implementing backlog a42 — add retry logic"),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([42]);
	});

	it("detects 'backlog item a10'", () => {
		mockIterate.mockReturnValue(yieldMessages("Working on backlog item a10"));

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([10]);
	});

	it("detects 'backlog a10'", () => {
		mockIterate.mockReturnValue(
			yieldMessages("This relates to backlog a10 and backlog a20"),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([10, 20]);
	});

	it("ignores a bare #42 (GitHub/Jira ref, not a backlog id)", () => {
		mockIterate.mockReturnValue(
			yieldMessages("See PR #42 and fixes issue #100"),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([]);
	});

	it("deduplicates IDs across messages", () => {
		mockIterate.mockReturnValue(
			yieldMessages("backlog run a42", "working on a42 still"),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([42]);
	});

	it("returns sorted IDs", () => {
		mockIterate.mockReturnValue(
			yieldMessages("backlog run a99", "backlog run a3", "backlog run a50"),
		);

		expect(scanSessionBacklogRefs("/s.jsonl")).toEqual([3, 50, 99]);
	});

	it("reads the full file for backlog scanning", () => {
		mockIterate.mockReturnValue(yieldMessages("backlog run a5"));

		scanSessionBacklogRefs("/s.jsonl");

		expect(mockIterate).toHaveBeenCalledWith(
			"/s.jsonl",
			Number.MAX_SAFE_INTEGER,
		);
	});
});
