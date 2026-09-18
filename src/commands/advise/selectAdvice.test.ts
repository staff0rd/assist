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

	it("drops a section turned off by advice.sections despite its condition", () => {
		const [decision] = selectAdvice([fragment("markdown", "always")], {
			...context,
			config: assistConfigSchema.parse({
				advice: { sections: { markdown: false } },
			}),
		});

		expect(decision).toMatchObject({
			included: false,
			reason: "advice.sections.markdown is false",
		});
	});

	it("keeps a section turned on by advice.sections despite its condition", () => {
		const [decision] = selectAdvice([fragment("jira-context", "jira")], {
			...context,
			config: assistConfigSchema.parse({
				advice: { sections: { "jira-context": true } },
			}),
		});

		expect(decision).toMatchObject({
			included: true,
			reason: "advice.sections.jira-context is true",
		});
	});

	it("rejects a name that matches no shipped fragment", () => {
		expect(() =>
			assistConfigSchema.parse({ advice: { sections: { verfiy: false } } }),
		).toThrow();
	});
});
