import { describe, expect, it } from "vitest";
import { diffQuery } from "./diffQuery";

describe("diffQuery", () => {
	it("encodes the cwd on its own when there is no session", () => {
		expect(diffQuery("/git/repo-2")).toBe("cwd=%2Fgit%2Frepo-2");
	});

	it("adds the session id when one is given", () => {
		expect(diffQuery("/git/repo-2", "sess-1")).toBe(
			"cwd=%2Fgit%2Frepo-2&session=sess-1",
		);
	});

	it("adds a scope other than the default", () => {
		expect(diffQuery("/git/repo-2", "sess-1", "uncommitted")).toBe(
			"cwd=%2Fgit%2Frepo-2&session=sess-1&scope=uncommitted",
		);
	});

	it("leaves the default scope out of the query", () => {
		expect(diffQuery("/git/repo-2", "sess-1", "all")).toBe(
			"cwd=%2Fgit%2Frepo-2&session=sess-1",
		);
	});
});
