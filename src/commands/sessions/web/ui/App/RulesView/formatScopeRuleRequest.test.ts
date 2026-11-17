import { describe, expect, it } from "vitest";
import type { RuleScope } from "../../../../../rules/types";
import { addRuleFlag } from "./addRuleFlag";
import { formatScopeRuleRequest } from "./formatScopeRuleRequest";

function scope(
	kind: RuleScope["kind"],
	extra: Partial<RuleScope> = {},
): RuleScope {
	return { id: kind, kind, name: kind, depth: 0, rules: [], ...extra };
}

function request(target: RuleScope, note: string) {
	return formatScopeRuleRequest(addRuleFlag(target), note);
}

describe("formatScopeRuleRequest", () => {
	it("addresses User (db) with --user", () => {
		expect(request(scope("user-db"), "  search the web  ")).toBe(
			"/add-rule --user\n\nsearch the web",
		);
	});

	it("addresses User (node) with --node", () => {
		expect(request(scope("user-node"), "a rule")).toBe(
			"/add-rule --node\n\na rule",
		);
	});

	it("names the repo for Repo (db)", () => {
		expect(
			request(scope("repo-db", { label: "github.com/org/assist" }), "a rule"),
		).toBe("/add-rule --repo github.com/org/assist\n\na rule");
	});

	it("falls back to the current repo when Repo (db) has no label", () => {
		expect(request(scope("repo-db"), "a rule")).toBe(
			"/add-rule --repo\n\na rule",
		);
	});

	it("points a nested CLAUDE.md scope at its file with --scope", () => {
		expect(request(scope("claude-md", { dir: "docs/" }), "a rule")).toBe(
			"/add-rule --scope docs/CLAUDE.md\n\na rule",
		);
	});

	it("points the root CLAUDE.md scope at CLAUDE.md", () => {
		expect(request(scope("claude-md", { dir: "" }), "a rule")).toBe(
			"/add-rule --scope CLAUDE.md\n\na rule",
		);
	});
});
