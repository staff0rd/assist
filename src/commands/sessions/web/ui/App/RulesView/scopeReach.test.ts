import { describe, expect, it } from "vitest";
import type { RuleScope } from "../../../../../rules/types";
import { scopeReach } from "./scopeReach";
import { scopeWhere } from "./scopeWhere";

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

describe("scopeReach", () => {
	it("says a root CLAUDE.md covers the whole repo", () => {
		expect(scopeReach(scope({ dir: "" }))).toBe(
			"Applies to every file in the repo.",
		);
	});

	it("says a nested CLAUDE.md covers its directory", () => {
		expect(scopeReach(scope({ dir: "docs/" }))).toBe("Applies under docs/.");
	});

	it("names the repo for repo (db)", () => {
		expect(scopeReach(scope({ kind: "repo-db", label: "assist" }))).toBe(
			"Applies to every session in assist, on every node.",
		);
	});
});

describe("scopeWhere", () => {
	it("names the node config file for user (node)", () => {
		expect(
			scopeWhere(scope({ kind: "user-node", label: "~/.assist.yml" })),
		).toBe("this node only · ~/.assist.yml");
	});

	it("has no subtitle for a CLAUDE.md", () => {
		expect(scopeWhere(scope({}))).toBeUndefined();
	});
});
