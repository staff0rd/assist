import { describe, expect, it } from "vitest";
import { buildAuthoredPhasePrompt } from "./buildAuthoredPhasePrompt";
import type { BacklogItem, PlanPhase } from "./types";

function makeItem(overrides: Partial<BacklogItem> = {}): BacklogItem {
	return {
		id: 7,
		type: "story",
		name: "Test item",
		acceptanceCriteria: ["AC1"],
		status: "in-progress",
		starred: false,
		...overrides,
	};
}

const phase: PlanPhase = { name: "Phase 1", tasks: [{ task: "do it" }] };

describe("buildAuthoredPhasePrompt", () => {
	it("injects /jira started as the first step on phase 1 when a jiraKey is set", () => {
		const prompt = buildAuthoredPhasePrompt(
			makeItem({ jiraKey: "BAD-671" }),
			1,
			phase,
		);

		expect(prompt).toContain("/jira started BAD-671");
		expect(prompt.indexOf("/jira started BAD-671")).toBeLessThan(
			prompt.indexOf("Focus ONLY on this phase."),
		);
	});

	it("omits the /jira started instruction on phase 1 when there is no jiraKey", () => {
		const prompt = buildAuthoredPhasePrompt(makeItem(), 1, phase);

		expect(prompt).not.toContain("/jira started");
	});

	it("omits the /jira started instruction for phase 2 even when a jiraKey is set", () => {
		const prompt = buildAuthoredPhasePrompt(
			makeItem({ jiraKey: "BAD-671" }),
			2,
			phase,
		);

		expect(prompt).not.toContain("/jira started");
	});
});
