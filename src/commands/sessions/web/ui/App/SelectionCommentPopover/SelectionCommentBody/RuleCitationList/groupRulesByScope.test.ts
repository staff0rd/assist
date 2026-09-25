import { describe, expect, it } from "vitest";
import { groupRulesByScope } from "./groupRulesByScope";

const rule = (code: string, source: string) => ({
	code,
	text: `${code} text`,
	source,
});

describe("groupRulesByScope", () => {
	it("groups consecutive rules by source, nearest scope first", () => {
		const scopes = groupRulesByScope([
			rule("R4", "refinement/CLAUDE.md"),
			rule("R5", "refinement/CLAUDE.md"),
			rule("R1", "CLAUDE.md"),
		]);

		expect(scopes.map((scope) => scope.source)).toEqual([
			"refinement/CLAUDE.md",
			"CLAUDE.md",
		]);
		expect(scopes[0].rules.map((r) => r.code)).toEqual(["R4", "R5"]);
		expect(scopes[1].rules.map((r) => r.code)).toEqual(["R1"]);
	});

	it("returns nothing for no rules", () => {
		expect(groupRulesByScope([])).toEqual([]);
	});
});
