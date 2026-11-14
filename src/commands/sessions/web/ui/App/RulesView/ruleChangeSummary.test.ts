import { describe, expect, it } from "vitest";
import type { RuleScope } from "../../../../../rules/types";
import { ruleChangeSummary } from "./ruleChangeSummary";

const scopes: RuleScope[] = [
	{ id: "user-db", kind: "user-db", name: "User (db)", depth: 0, rules: [] },
	{
		id: "claude-md:",
		kind: "claude-md",
		name: "CLAUDE.md",
		dir: "",
		depth: 0,
		rules: [],
	},
];

describe("ruleChangeSummary", () => {
	it("shows only what an edit changes and keeps the code", () => {
		expect(
			ruleChangeSummary(
				{
					id: "1",
					change: {
						kind: "edit",
						scopeId: "claude-md:",
						rule: { code: "R1", title: "Terse", text: "Say less." },
						to: "claude-md:",
						title: "Terse",
						text: "Say nothing.",
					},
				},
				scopes,
			),
		).toEqual({
			heading: "Edit R1",
			rows: [
				{ label: "Scope", after: "CLAUDE.md" },
				{ label: "Title", after: "Terse" },
				{ label: "Rule", before: "Say less.", after: "Say nothing." },
			],
			codeNote: "Keeps R1",
		});
	});

	it("names the code a move into a CLAUDE.md allocates", () => {
		const summary = ruleChangeSummary(
			{
				id: "1",
				code: "R17",
				change: {
					kind: "edit",
					scopeId: "user-db",
					rule: { title: "Links", text: "Give the URL" },
					to: "claude-md:",
					title: "Links",
					text: "Give the URL",
				},
			},
			scopes,
		);

		expect(summary.heading).toBe("Move “Links”");
		expect(summary.rows[0]).toEqual({
			label: "Scope",
			before: "User (db)",
			after: "CLAUDE.md",
		});
		expect(summary.codeNote).toBe("Gets R17, the next repo-wide code");
	});

	it("says a move into advice.rules drops the code", () => {
		const summary = ruleChangeSummary(
			{
				id: "1",
				change: {
					kind: "edit",
					scopeId: "claude-md:",
					rule: { code: "R3", title: "Links", text: "Give the URL" },
					to: "user-db",
					title: "Links",
					text: "Give the URL",
				},
			},
			scopes,
		);

		expect(summary.codeNote).toBe(
			"Drops R3; advice.rules entries have no code",
		);
	});
});
