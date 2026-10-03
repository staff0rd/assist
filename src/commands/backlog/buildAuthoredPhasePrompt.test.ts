import { describe, expect, it } from "vitest";
import { makeBacklogItem } from "../../test/mothers/makeBacklogItem";
import { buildAuthoredPhasePrompt } from "./buildAuthoredPhasePrompt";
import type { PlanPhase } from "./types";

const phase: PlanPhase = { name: "Phase 1", tasks: [{ task: "do it" }] };

describe("buildAuthoredPhasePrompt", () => {
	it("injects /jira started as the first step on phase 1 when a jiraKey is set", () => {
		const prompt = buildAuthoredPhasePrompt(
			makeBacklogItem({ jiraKey: "BAD-671" }),
			1,
			phase,
		);

		expect(prompt).toContain("/jira started BAD-671");
		expect(prompt.indexOf("/jira started BAD-671")).toBeLessThan(
			prompt.indexOf("Focus ONLY on this phase."),
		);
	});

	it("omits the /jira started instruction on phase 1 when there is no jiraKey", () => {
		const prompt = buildAuthoredPhasePrompt(makeBacklogItem(), 1, phase);

		expect(prompt).not.toContain("/jira started");
	});

	it("omits the /jira started instruction for phase 2 even when a jiraKey is set", () => {
		const prompt = buildAuthoredPhasePrompt(
			makeBacklogItem({ jiraKey: "BAD-671" }),
			2,
			phase,
		);

		expect(prompt).not.toContain("/jira started");
	});

	describe("commitBeforePhaseEnd", () => {
		const phaseWithChecks: PlanPhase = {
			name: "Phase 1",
			tasks: [{ task: "do it" }],
			manualChecks: ["click the button"],
		};

		it("leaves the prompt unchanged when the flag is off", () => {
			const prompt = buildAuthoredPhasePrompt(
				makeBacklogItem(),
				1,
				phaseWithChecks,
				{
					commitBeforePhaseEnd: false,
				},
			);

			expect(prompt).not.toContain("/commit");
			expect(prompt).toBe(
				buildAuthoredPhasePrompt(makeBacklogItem(), 1, phaseWithChecks),
			);
		});

		it("leaves a phase without manual checks unchanged when the flag is off", () => {
			const prompt = buildAuthoredPhasePrompt(makeBacklogItem(), 1, phase, {
				commitBeforePhaseEnd: false,
			});

			expect(prompt).not.toContain("/commit");
			expect(prompt).toBe(
				buildAuthoredPhasePrompt(makeBacklogItem(), 1, phase),
			);
		});

		it("instructs the agent to commit before the manual checks when the flag is on", () => {
			const prompt = buildAuthoredPhasePrompt(
				makeBacklogItem(),
				1,
				phaseWithChecks,
				{
					commitBeforePhaseEnd: true,
				},
			);

			expect(prompt).toContain(
				"Once verify passes, run /commit to commit the work before asking the user to perform the manual checks below.",
			);
			expect(prompt.indexOf("/commit")).toBeLessThan(
				prompt.indexOf(
					"Before marking this phase as done, ask the user to perform these manual checks:",
				),
			);
		});

		it("instructs the agent to commit before phase-done when the phase has no manual checks", () => {
			const prompt = buildAuthoredPhasePrompt(makeBacklogItem(), 1, phase, {
				commitBeforePhaseEnd: true,
			});

			expect(prompt).toContain(
				"Once verify passes, run /commit to commit the work before marking this phase as done.",
			);
			expect(prompt.indexOf("/verify")).toBeLessThan(prompt.indexOf("/commit"));
			expect(prompt.indexOf("/commit")).toBeLessThan(
				prompt.indexOf("assist backlog phase-done"),
			);
		});

		it("emits a single commit instruction when the phase has manual checks", () => {
			const prompt = buildAuthoredPhasePrompt(
				makeBacklogItem(),
				1,
				phaseWithChecks,
				{
					commitBeforePhaseEnd: true,
				},
			);

			expect(prompt.match(/\/commit/g)).toHaveLength(1);
			expect(prompt).not.toContain(
				"Once verify passes, run /commit to commit the work before marking this phase as done.",
			);
		});
	});
});
