import { describe, expect, it } from "vitest";
import { formatRuleComment } from "./formatRuleComment";

describe("formatRuleComment", () => {
	it("names a CLAUDE.md rule by code and file", () => {
		expect(
			formatRuleComment({
				rule: { code: "R9", title: "Design system", text: "Use tokens." },
				scope: {
					id: "claude-md:ui/",
					kind: "claude-md",
					name: "ui/CLAUDE.md",
					depth: 1,
					rules: [],
				},
				note: "Mention density",
			}),
		).toBe(
			"Rule R9 in `ui/CLAUDE.md`\n\n```\nDesign system — Use tokens.\n```\n\nMention density",
		);
	});

	it("names an advice.rules entry by title and scope", () => {
		expect(
			formatRuleComment({
				rule: { title: "Links", text: "Give the URL" },
				scope: {
					id: "repo-db",
					kind: "repo-db",
					name: "Repo (db)",
					label: "github.com/org/assist",
					depth: 0,
					rules: [],
				},
				note: "Too strict",
			}).split("\n")[0],
		).toBe('Rule "Links" in advice.rules, Repo (db): github.com/org/assist');
	});
});
