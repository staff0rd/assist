import { describe, expect, it } from "vitest";
import { resolveReadTimeTarget } from "./resolveReadTimeTarget";

describe("resolveReadTimeTarget", () => {
	describe("when the target is -", () => {
		it("should read from stdin", () => {
			expect(resolveReadTimeTarget("-")).toEqual({ kind: "stdin" });
		});
	});

	describe("when the target is a number", () => {
		it("should target that PR in the current repo", () => {
			expect(resolveReadTimeTarget("42")).toEqual({
				kind: "pr",
				number: 42,
				repo: null,
			});
		});

		it("should not treat a version-like value as a number", () => {
			expect(resolveReadTimeTarget("1.2")).toEqual({
				kind: "file",
				path: "1.2",
			});
		});
	});

	describe("when the target is a GitHub pull request URL", () => {
		it("should target that PR in the URL's repo", () => {
			expect(
				resolveReadTimeTarget("https://github.com/acme/widgets/pull/7"),
			).toEqual({
				kind: "pr",
				number: 7,
				repo: { org: "acme", repo: "widgets" },
			});
		});

		it("should accept a trailing path segment", () => {
			expect(
				resolveReadTimeTarget("https://github.com/acme/widgets/pull/7/files"),
			).toEqual({
				kind: "pr",
				number: 7,
				repo: { org: "acme", repo: "widgets" },
			});
		});

		it("should accept a fragment", () => {
			expect(
				resolveReadTimeTarget(
					"https://github.com/acme/widgets/pull/7#issuecomment-1",
				),
			).toEqual({
				kind: "pr",
				number: 7,
				repo: { org: "acme", repo: "widgets" },
			});
		});

		it("should ignore surrounding whitespace", () => {
			expect(
				resolveReadTimeTarget("  https://github.com/acme/widgets/pull/7  "),
			).toEqual({
				kind: "pr",
				number: 7,
				repo: { org: "acme", repo: "widgets" },
			});
		});

		it("should treat an issue URL as a file path", () => {
			expect(
				resolveReadTimeTarget("https://github.com/acme/widgets/issues/7"),
			).toEqual({
				kind: "file",
				path: "https://github.com/acme/widgets/issues/7",
			});
		});
	});

	describe("when the target is anything else", () => {
		it("should read it as a file path", () => {
			expect(resolveReadTimeTarget("drafts/body.md")).toEqual({
				kind: "file",
				path: "drafts/body.md",
			});
		});

		it("should preserve a path containing a dash", () => {
			expect(resolveReadTimeTarget("./read-time-draft.md")).toEqual({
				kind: "file",
				path: "./read-time-draft.md",
			});
		});
	});
});
