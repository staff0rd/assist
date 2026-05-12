import { describe, expect, it } from "vitest";
import type { LineBoundFinding } from "./partitionFindings";
import { buildCommentBody } from "./postFindings";

const FINDING: LineBoundFinding = {
	title: "Null pointer dereference",
	severity: "blocker",
	source: "confirmed",
	location: "src/foo.ts:42",
	impact: "Crash on null input.",
	recommendation: "Add a null guard before dereferencing.",
	file: "src/foo.ts",
	line: 42,
};

describe("buildCommentBody", () => {
	it("includes severity, title, impact and recommendation", () => {
		const body = buildCommentBody(FINDING);
		expect(body).toContain("blocker");
		expect(body).toContain("Null pointer dereference");
		expect(body).toContain("Crash on null input.");
		expect(body).toContain("Add a null guard before dereferencing.");
	});

	it("sanitises reviewer names that would be rejected by prs comment", () => {
		const body = buildCommentBody({
			...FINDING,
			impact: "Claude flagged this and Opus also raised it.",
		});
		expect(body.toLowerCase()).not.toContain("claude");
		expect(body.toLowerCase()).not.toContain("opus");
		expect(body).toContain("the reviewer");
	});

	it("omits optional sections when blank", () => {
		const body = buildCommentBody({
			...FINDING,
			impact: "",
			recommendation: "",
		});
		expect(body).toContain("blocker");
		expect(body).not.toContain("Impact:");
		expect(body).not.toContain("Recommendation:");
	});
});
