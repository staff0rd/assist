import { describe, expect, it } from "vitest";
import { createGmailCoverage } from "./createGmailCoverage";

const search = "mcp__claude_ai_Gmail__search_threads";
const getThread = "mcp__claude_ai_Gmail__get_thread";

describe("createGmailCoverage", () => {
	it("records threads returned by search and those opened with their body", () => {
		const coverage = createGmailCoverage();
		coverage.onAssistant([
			{ type: "tool_use", id: "s1", name: search, input: { query: "q" } },
		]);
		coverage.onUser([
			{
				type: "tool_result",
				tool_use_id: "s1",
				content: [
					{
						type: "text",
						text: JSON.stringify({
							threads: [{ id: "t1" }, { id: "t2" }, { id: "t3" }],
						}),
					},
				],
			},
		]);
		coverage.onAssistant([
			{
				type: "tool_use",
				id: "g1",
				name: getThread,
				input: { threadId: "t1", messageFormat: "PLAIN_TEXT" },
			},
			{
				type: "tool_use",
				id: "g2",
				name: getThread,
				input: { threadId: "t2", messageFormat: "MINIMAL" },
			},
		]);
		expect(coverage.current()).toEqual({
			found: ["t1", "t2", "t3"],
			opened: ["t1"],
		});
	});

	it("ignores results of other tools and unparseable results", () => {
		const coverage = createGmailCoverage();
		coverage.onAssistant([
			{ type: "tool_use", id: "s1", name: search, input: {} },
		]);
		coverage.onUser([
			{
				type: "tool_result",
				tool_use_id: "other",
				content: '{"threads":[{"id":"x"}]}',
			},
			{ type: "tool_result", tool_use_id: "s1", content: "rate limited" },
		]);
		expect(coverage.current().found).toEqual([]);
	});
});
