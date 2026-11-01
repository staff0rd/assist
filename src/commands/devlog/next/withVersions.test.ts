import { describe, expect, it } from "vitest";
import type { Commit } from "../types";
import { withVersions } from "./withVersions";

function commit(hash: string): Commit {
	return { date: "2026-08-10", hash, message: hash, files: [] };
}

const commits = [commit("a"), commit("b")];

describe("withVersions", () => {
	it("drops a version that never changes in an untagged repo", () => {
		const result = withVersions(commits, () => "1.0.0", false);
		expect(result.map((c) => c.version)).toEqual([null, null]);
	});

	it("keeps a changing version in an untagged repo", () => {
		const versions: Record<string, string> = { a: "1.0.0", b: "1.1.0" };
		const result = withVersions(commits, (h) => versions[h], false);
		expect(result.map((c) => c.version)).toEqual(["v1.0", "v1.1"]);
	});

	it("keeps an unchanging version in a tagged repo", () => {
		const result = withVersions(commits, () => "0.563.2", true);
		expect(result.map((c) => c.version)).toEqual(["v0.563", "v0.563"]);
	});

	it("leaves commits without a version unversioned", () => {
		const result = withVersions(commits, () => null, true);
		expect(result.map((c) => c.version)).toEqual([null, null]);
	});
});
