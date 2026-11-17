import { describe, expect, it } from "vitest";
import type { RuleScope } from "../../../../../rules/types";
import { addRuleFlag } from "./addRuleFlag";
import { formatScopeRuleRequest } from "./formatScopeRuleRequest";

function scope(kind: RuleScope["kind"], label?: string): RuleScope {
	return {
		id: kind,
		kind,
		name: kind,
		depth: 0,
		rules: [],
		...(label ? { label } : {}),
	};
}

function request(target: RuleScope, note: string) {
	const flag = addRuleFlag(target);
	return flag && formatScopeRuleRequest(flag, note);
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
		expect(request(scope("repo-db", "github.com/org/assist"), "a rule")).toBe(
			"/add-rule --repo github.com/org/assist\n\na rule",
		);
	});

	it("falls back to the current repo when Repo (db) has no label", () => {
		expect(request(scope("repo-db"), "a rule")).toBe(
			"/add-rule --repo\n\na rule",
		);
	});

	it("has no flag for a CLAUDE.md scope yet", () => {
		expect(addRuleFlag(scope("claude-md"))).toBeUndefined();
	});
});
