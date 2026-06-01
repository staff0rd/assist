import { describe, expect, it } from "vitest";
import { normalizeOrigin } from "./getCurrentOrigin";

describe("normalizeOrigin", () => {
	it("canonicalises ssh (scp-like) and https forms to the same key", () => {
		const ssh = normalizeOrigin("git@github.com:Org/Repo.git");
		const https = normalizeOrigin("https://github.com/Org/Repo.git");
		expect(ssh).toBe("github.com/Org/Repo");
		expect(https).toBe("github.com/Org/Repo");
		expect(ssh).toBe(https);
	});

	it("strips a trailing .git", () => {
		expect(normalizeOrigin("https://github.com/org/repo.git")).toBe(
			"github.com/org/repo",
		);
		expect(normalizeOrigin("https://github.com/org/repo")).toBe(
			"github.com/org/repo",
		);
	});

	it("lowercases the host but preserves path case", () => {
		expect(normalizeOrigin("https://GitHub.com/Org/Repo")).toBe(
			"github.com/Org/Repo",
		);
	});

	it("drops userinfo and port", () => {
		expect(normalizeOrigin("ssh://git@github.com:22/org/repo.git")).toBe(
			"github.com/org/repo",
		);
		expect(normalizeOrigin("https://user:pass@gitlab.com/group/sub/repo")).toBe(
			"gitlab.com/group/sub/repo",
		);
	});

	it("strips trailing slashes", () => {
		expect(normalizeOrigin("https://github.com/org/repo/")).toBe(
			"github.com/org/repo",
		);
	});

	it("is idempotent for an already-normalized key", () => {
		expect(normalizeOrigin("github.com/org/repo")).toBe("github.com/org/repo");
	});
});
