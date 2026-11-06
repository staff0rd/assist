import { describe, expect, it } from "vitest";
import type { VersionSource } from "../resolveVersionSource";
import type { Commit } from "../types";
import { withVersions } from "./withVersions";

function commit(hash: string): Commit {
	return { date: "2026-08-10", hash, message: hash, files: [] };
}

const commits = [commit("a"), commit("b")];

function packageSource(versionAt: VersionSource["versionAt"]): VersionSource {
	return { kind: "package", versionAt, current: () => null };
}

describe("withVersions from package.json", () => {
	it("drops a version that never changes in an untagged repo", () => {
		const result = withVersions(
			commits,
			packageSource(() => "1.0.0"),
			false,
		);
		expect(result.map((c) => c.version)).toEqual([null, null]);
	});

	it("keeps a changing version in an untagged repo", () => {
		const versions: Record<string, string> = { a: "1.0.0", b: "1.1.0" };
		const result = withVersions(
			commits,
			packageSource((h) => versions[h]),
			false,
		);
		expect(result.map((c) => c.version)).toEqual(["v1.0", "v1.1"]);
	});

	it("keeps an unchanging version in a tagged repo", () => {
		const result = withVersions(
			commits,
			packageSource(() => "0.563.2"),
			true,
		);
		expect(result.map((c) => c.version)).toEqual(["v0.563", "v0.563"]);
	});

	it("leaves commits without a version unversioned", () => {
		const result = withVersions(
			commits,
			packageSource(() => null),
			true,
		);
		expect(result.map((c) => c.version)).toEqual([null, null]);
	});
});

describe("withVersions from tags", () => {
	it("keeps the full tag version and leaves the untagged tail unversioned", () => {
		const versions: Record<string, string | null> = {
			a: "v0.2.0",
			b: null,
		};
		const result = withVersions(
			commits,
			{ kind: "tags", versionAt: (h) => versions[h], current: () => null },
			true,
		);
		expect(result.map((c) => c.version)).toEqual(["v0.2.0", null]);
	});
});
