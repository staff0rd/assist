import { describe, expect, it } from "vitest";
import type { ConversationEvent } from "../../../shared/harnessAdapters/types";
import { scanSessionBacklogRefs } from "./scanSessionBacklogRefs";

function said(...messages: string[]): ConversationEvent[] {
	return messages.map((text) => ({ kind: "message", role: "user", text }));
}

describe("scanSessionBacklogRefs", () => {
	it("returns empty array when no messages", () => {
		expect(scanSessionBacklogRefs([])).toEqual([]);
	});

	it.each([
		["assist backlog run a42", [42]],
		["assist backlog run a42 1", [42]],
		['assist backlog phase-done a87 1 "done"', [87]],
		['assist backlog comment a87 "text"', [87]],
		["Implementing backlog a42 — add retry logic", [42]],
		["Working on backlog item a10", [10]],
		["This relates to backlog a10 and backlog a20", [10, 20]],
		["See PR #42 and fixes issue #100", []],
	])("detects references in %j", (text, expected) => {
		expect(scanSessionBacklogRefs(said(text))).toEqual(expected);
	});

	it("deduplicates IDs across messages", () => {
		expect(
			scanSessionBacklogRefs(said("backlog run a42", "working on a42 still")),
		).toEqual([42]);
	});

	it("returns sorted IDs", () => {
		expect(
			scanSessionBacklogRefs(
				said("backlog run a99", "backlog run a3", "backlog run a50"),
			),
		).toEqual([3, 50, 99]);
	});

	it("reads only user messages, not assistant replies or tool output", () => {
		expect(
			scanSessionBacklogRefs([
				{ kind: "message", role: "assistant", text: "backlog run a7" },
				{ kind: "toolResult", text: "backlog run a8" },
				{ kind: "tool", tool: "Bash", target: "a9", operations: [] },
				...said("backlog run a5"),
			]),
		).toEqual([5]);
	});
});
