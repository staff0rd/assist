import { describe, expect, it } from "vitest";
import { diffQuery } from "./diffQuery";

const legacy = { conversationId: "sess-1" };

describe("diffQuery", () => {
	it("encodes the cwd on its own when there is no session", () => {
		expect(diffQuery("/git/repo-2")).toBe("cwd=%2Fgit%2Frepo-2");
	});

	it("adds the conversation id alone for a legacy Claude session", () => {
		expect(diffQuery("/git/repo-2", legacy)).toBe(
			"cwd=%2Fgit%2Frepo-2&session=sess-1",
		);
	});

	it("adds the harness for a non-Claude conversation", () => {
		expect(
			diffQuery("/git/repo-2", { conversationId: "t-1", harness: "codex" }),
		).toBe("cwd=%2Fgit%2Frepo-2&session=t-1&harness=codex");
	});

	it("adds a scope other than the default", () => {
		expect(diffQuery("/git/repo-2", legacy, "uncommitted")).toBe(
			"cwd=%2Fgit%2Frepo-2&session=sess-1&scope=uncommitted",
		);
	});

	it("leaves the default scope out of the query", () => {
		expect(diffQuery("/git/repo-2", legacy, "all")).toBe(
			"cwd=%2Fgit%2Frepo-2&session=sess-1",
		);
	});
});
