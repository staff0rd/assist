import { describe, expect, it } from "vitest";
import { createGmailCoverage } from "./createGmailCoverage";

describe("createGmailCoverage", () => {
	it("records threads returned by search and those opened with their body", () => {
		const coverage = createGmailCoverage();
		coverage.onEvent({
			type: "toolCall",
			callId: "s1",
			tool: "gmail.searchThreads",
			label: "Gmail search_threads",
			input: { query: "q" },
		});
		coverage.onEvent({
			type: "toolResult",
			callId: "s1",
			text: JSON.stringify({
				threads: [{ id: "t1" }, { id: "t2" }, { id: "t3" }],
			}),
		});
		coverage.onEvent({
			type: "toolCall",
			callId: "g1",
			tool: "gmail.getThread",
			label: "Gmail get_thread",
			input: { threadId: "t1", messageFormat: "PLAIN_TEXT" },
		});
		coverage.onEvent({
			type: "toolCall",
			callId: "g2",
			tool: "gmail.getThread",
			label: "Gmail get_thread",
			input: { threadId: "t2", messageFormat: "MINIMAL" },
		});
		expect(coverage.current()).toEqual({
			found: ["t1", "t2", "t3"],
			opened: ["t1"],
		});
	});

	it("ignores results of other tools and unparseable results", () => {
		const coverage = createGmailCoverage();
		coverage.onEvent({
			type: "toolCall",
			callId: "s1",
			tool: "gmail.searchThreads",
			label: "Gmail search_threads",
			input: {},
		});
		coverage.onEvent({
			type: "toolResult",
			callId: "other",
			text: '{"threads":[{"id":"x"}]}',
		});
		coverage.onEvent({
			type: "toolResult",
			callId: "s1",
			text: "rate limited",
		});
		expect(coverage.current().found).toEqual([]);
	});
});
