import { describe, expect, it } from "vitest";
import type { RuleScope } from "../../../../../rules/types";
import { scopeInEffect } from "./scopeInEffect";

function scope(overrides: Partial<RuleScope>): RuleScope {
	return {
		id: "x",
		kind: "claude-md",
		name: "x",
		depth: 0,
		rules: [],
		...overrides,
	};
}

const docs = scope({ dir: "docs/" });

describe("scopeInEffect", () => {
	it("keeps every scope in effect for an empty path", () => {
		expect(scopeInEffect(docs, "")).toBe(true);
		expect(scopeInEffect(docs, "   ")).toBe(true);
	});

	it("keeps user and repo (db) scopes in effect for any path", () => {
		for (const kind of ["user-db", "user-node", "repo-db"] as const) {
			expect(scopeInEffect(scope({ kind }), "src/index.ts")).toBe(true);
		}
	});

	it("keeps the root CLAUDE.md in effect for any path", () => {
		expect(scopeInEffect(scope({ dir: "" }), "src/index.ts")).toBe(true);
	});

	it("matches paths under a nested CLAUDE.md's directory", () => {
		expect(scopeInEffect(docs, "docs/src/index.md")).toBe(true);
		expect(scopeInEffect(docs, "docs")).toBe(true);
		expect(scopeInEffect(docs, "docs/")).toBe(true);
	});

	it("rejects paths outside the directory, including prefix siblings", () => {
		expect(scopeInEffect(docs, "src/index.ts")).toBe(false);
		expect(scopeInEffect(docs, "docsite/index.md")).toBe(false);
		expect(scopeInEffect(docs, "doc")).toBe(false);
	});

	it("normalises leading ./ or /, and backslashes", () => {
		expect(scopeInEffect(docs, "./docs/a.md")).toBe(true);
		expect(scopeInEffect(docs, "/docs/a.md")).toBe(true);
		expect(scopeInEffect(docs, String.raw`docs\a.md`)).toBe(true);
	});

	it("strips the repo root from an absolute path", () => {
		expect(
			scopeInEffect(docs, "/home/me/assist/docs/a.md", "/home/me/assist"),
		).toBe(true);
		expect(
			scopeInEffect(docs, "/home/me/assist/src/a.ts", "/home/me/assist/"),
		).toBe(false);
	});
});
