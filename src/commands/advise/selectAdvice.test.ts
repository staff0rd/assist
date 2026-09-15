import { describe, expect, it } from "vitest";
import { assistConfigSchema } from "../../shared/types";
import type { AdviceFragment } from "./parseAdviceFragment";
import { selectAdvice } from "./selectAdvice";

const context = {
	config: assistConfigSchema.parse({}),
	rootDir: "/repo",
};

function fragment(name: string, when: string): AdviceFragment {
	return { name, title: name, when, body: name };
}

describe("selectAdvice", () => {
	it("reports why each fragment was kept or dropped", () => {
		const decisions = selectAdvice(
			[fragment("always-on", "always"), fragment("jira-thing", "jira")],
			context,
		);

		expect(decisions).toEqual([
			{
				fragment: fragment("always-on", "always"),
				included: true,
				reason: "always included",
			},
			{
				fragment: fragment("jira-thing", "jira"),
				included: false,
				reason: "jira is not configured",
			},
		]);
	});

	it("drops a fragment naming a condition that is not registered", () => {
		const [decision] = selectAdvice([fragment("odd", "nonsense")], context);

		expect(decision).toMatchObject({
			included: false,
			reason: 'unknown condition "nonsense"',
		});
	});
});
