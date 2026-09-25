import { describe, expect, it } from "vitest";
import { formatAddRuleCommand } from "./formatAddRuleCommand";

describe("formatAddRuleCommand", () => {
	it("names the file the selection came from", () => {
		expect(
			formatAddRuleCommand({
				path: "refinement/option.md",
				quote: "the option is best",
				note: "name the decision",
			}),
		).toBe(
			"/add-rule\n\nFile: refinement/option.md\n\n```\nthe option is best\n```\n\nname the decision",
		);
	});

	it("omits the file line when the surface has no path", () => {
		expect(formatAddRuleCommand({ quote: "quoted", note: "a rule" })).toBe(
			"/add-rule\n\n```\nquoted\n```\n\na rule",
		);
	});
});
