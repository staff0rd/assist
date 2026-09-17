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

	it("drops a fragment named by advice.exclude despite its condition", () => {
		const [decision] = selectAdvice([fragment("markdown", "always")], {
			...context,
			config: assistConfigSchema.parse({ advice: { exclude: ["markdown"] } }),
		});

		expect(decision).toMatchObject({
			included: false,
			reason: "excluded by advice.exclude",
		});
	});

	it("keeps a fragment named by advice.include despite its condition", () => {
		const [decision] = selectAdvice([fragment("jira-context", "jira")], {
			...context,
			config: assistConfigSchema.parse({
				advice: { include: ["jira-context"] },
			}),
		});

		expect(decision).toMatchObject({
			included: true,
			reason: "included by advice.include",
		});
	});

	it("lets advice.exclude win over advice.include for the same fragment", () => {
		const [decision] = selectAdvice([fragment("markdown", "always")], {
			...context,
			config: assistConfigSchema.parse({
				advice: { include: ["markdown"], exclude: ["markdown"] },
			}),
		});

		expect(decision.included).toBe(false);
	});

	it("rejects a name that matches no shipped fragment", () => {
		expect(() =>
			assistConfigSchema.parse({ advice: { exclude: ["verfiy"] } }),
		).toThrow();
	});
});
