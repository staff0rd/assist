import { describe, expect, it } from "vitest";
import type { ExistingComment } from "./fetchExistingComments";
import { formatPriorComments } from "./formatPriorComments";

function comment(overrides: Partial<ExistingComment>): ExistingComment {
	return {
		id: 1,
		threadId: "T1",
		file: "src/foo.ts",
		line: 10,
		author: "alice",
		body: "Looks risky.",
		inReplyToId: null,
		resolved: false,
		outdated: false,
		...overrides,
	};
}

describe("formatPriorComments", () => {
	it("returns empty string when there are no comments", () => {
		expect(formatPriorComments([])).toBe("");
	});

	it("renders a heading, author, body, and file:line for a single comment", () => {
		const out = formatPriorComments([comment({})]);
		expect(out).toContain("## Prior review comments");
		expect(out).toContain("### src/foo.ts:10");
		expect(out).toContain("**alice**: Looks risky.");
	});

	it("tags resolved and outdated threads on the root", () => {
		const out = formatPriorComments([
			comment({ id: 1, resolved: true, outdated: true }),
		]);
		expect(out).toContain("### src/foo.ts:10 [resolved, outdated]");
	});

	it("groups replies under the same thread root", () => {
		const root = comment({
			id: 1,
			threadId: "T1",
			body: "Should handle null.",
		});
		const reply = comment({
			id: 2,
			threadId: "T1",
			inReplyToId: 1,
			author: "bob",
			body: "Fixed in next commit.",
		});
		const out = formatPriorComments([root, reply]);
		const headings = out.match(/### /g) ?? [];
		expect(headings).toHaveLength(1);
		expect(out).toContain("**alice**: Should handle null.");
		expect(out).toContain("**bob** (reply): Fixed in next commit.");
	});

	it("renders the file path without :line when line is null", () => {
		const out = formatPriorComments([comment({ line: null })]);
		expect(out).toContain("### src/foo.ts\n");
	});

	it("falls back to grouping by inReplyToId when threadId is missing", () => {
		const root = comment({ id: 1, threadId: "" });
		const reply = comment({
			id: 2,
			threadId: "",
			inReplyToId: 1,
			author: "bob",
		});
		const out = formatPriorComments([root, reply]);
		const headings = out.match(/### /g) ?? [];
		expect(headings).toHaveLength(1);
		expect(out).toContain("**bob** (reply):");
	});
});
