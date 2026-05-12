import { describe, expect, it } from "vitest";
import { buildRequest } from "./buildRequest";
import type { ExistingComment } from "./fetchExistingComments";

const CONTEXT = {
	branch: "feature/x",
	sha: "abcdef0123456789",
	shortSha: "abcdef0",
	prNumber: 42,
	baseRef: "main",
	baseSha: "1111111111111111111111111111111111111111",
	headRef: "feature/x",
	headSha: "2222222222222222222222222222222222222222",
	changedFiles: ["src/foo.ts"],
	diff: "diff --git a/src/foo.ts b/src/foo.ts\n+added line\n",
};

describe("buildRequest", () => {
	it("omits the prior comments section when none are provided", () => {
		const md = buildRequest(CONTEXT);
		expect(md).not.toContain("## Prior review comments");
		expect(md).toContain("## Diff (PR #42:");
	});

	it("omits the prior comments section for the no-PR case (null)", () => {
		const md = buildRequest(CONTEXT, null);
		expect(md).not.toContain("## Prior review comments");
	});

	it("omits the prior comments section when comments list is empty", () => {
		const md = buildRequest(CONTEXT, []);
		expect(md).not.toContain("## Prior review comments");
	});

	it("records the PR number and base/head SHAs in the header", () => {
		const md = buildRequest(CONTEXT);
		expect(md).toContain("- PR: #42");
		expect(md).toContain(`- Base SHA: \`${CONTEXT.baseSha}\``);
		expect(md).toContain(`- Head SHA: \`${CONTEXT.headSha}\``);
		expect(md).toContain("- Base ref: `main`");
	});

	it("includes the prior comments section between Changed files and Diff", () => {
		const priorComments: ExistingComment[] = [
			{
				id: 1,
				threadId: "T1",
				file: "src/foo.ts",
				line: 5,
				author: "alice",
				body: "Nit: rename.",
				inReplyToId: null,
				resolved: false,
				outdated: false,
			},
		];
		const md = buildRequest(CONTEXT, priorComments);
		const changedIdx = md.indexOf("## Changed files");
		const priorIdx = md.indexOf("## Prior review comments");
		const diffIdx = md.indexOf("## Diff (PR #42:");
		expect(changedIdx).toBeGreaterThanOrEqual(0);
		expect(priorIdx).toBeGreaterThan(changedIdx);
		expect(diffIdx).toBeGreaterThan(priorIdx);
		expect(md).toContain("**alice**: Nit: rename.");
	});
});
