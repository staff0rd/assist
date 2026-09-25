import { describe, expect, it } from "vitest";
import { formatDiffComment } from "./formatDiffComment";

describe("formatDiffComment", () => {
	it("writes path, line range, fenced quote and note", () => {
		expect(
			formatDiffComment({
				path: "src/commands/foo.ts",
				startLine: 42,
				endLine: 44,
				quote: "if (!y) return\ndoThing(y)",
				note: "this should be a guard clause",
			}),
		).toBe(
			[
				"src/commands/foo.ts:42-44",
				"",
				"```",
				"if (!y) return",
				"doThing(y)",
				"```",
				"",
				"this should be a guard clause",
			].join("\n"),
		);
	});

	it("writes a single line number when the selection is one line", () => {
		const message = formatDiffComment({
			path: "a.ts",
			startLine: 7,
			endLine: 7,
			quote: "const x = 1",
			note: "why",
		});

		expect(message.split("\n")[0]).toBe("a.ts:7");
	});

	it("lengthens the fence past any backtick run in the quote", () => {
		const message = formatDiffComment({
			path: "README.md",
			startLine: 1,
			endLine: 3,
			quote: "```ts\nconst x = 1\n```",
			note: "nested fence",
		});

		expect(message).toContain("````\n```ts");
		expect(message).toContain("```\n````\n");
	});
});
