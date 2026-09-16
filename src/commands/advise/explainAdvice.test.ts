import { describe, expect, it } from "vitest";
import { assistConfigSchema } from "../../shared/types";
import { explainAdvice } from "./explainAdvice";
import { loadAdviceFragments } from "./loadAdviceFragments";

const fragments = loadAdviceFragments();

const lines = explainAdvice(
	{ config: assistConfigSchema.parse({}), rootDir: "/repo" },
	fragments,
).split("\n");

describe("explainAdvice", () => {
	it("lists every shipped fragment once", () => {
		expect(lines).toHaveLength(fragments.length);
		for (const fragment of fragments)
			expect(lines.some((line) => line.includes(fragment.name))).toBe(true);
	});

	it("marks an always-on fragment included and gives the reason", () => {
		const line = lines.find((entry) => entry.includes("editing-files")) ?? "";

		expect(line).toContain("✓");
		expect(line).toContain("always included");
	});

	it("marks an unmet fragment excluded and gives the reason", () => {
		const line = lines.find((entry) => entry.includes("jira-context")) ?? "";

		expect(line).toContain("✗");
		expect(line).toContain("jira is not configured");
	});
});
