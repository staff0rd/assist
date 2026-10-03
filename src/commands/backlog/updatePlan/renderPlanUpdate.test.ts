import { describe, expect, it } from "vitest";
import { makeBacklogItem } from "../../../test/mothers/makeBacklogItem";
import type { PlanPhase } from "../types";
import type { PlanUpdatePhase } from "./planUpdateSchema";
import { renderPlanUpdate } from "./renderPlanUpdate";

function stored(
	name: string,
	tasks: string[],
	manualChecks?: string[],
): PlanPhase {
	const phase: PlanPhase = { name, tasks: tasks.map((task) => ({ task })) };
	if (manualChecks) phase.manualChecks = manualChecks;
	return phase;
}

function payload(
	name: string,
	tasks: string[],
	manualChecks: string[] = [],
): PlanUpdatePhase {
	return { name, tasks, manualChecks };
}

const threePhasePlan = [
	stored("Read the payload", ["Parse the JSON"]),
	stored("Render the pane", ["Render the phases"], ["Open the pane"]),
	stored("Wire the command", ["Register update-plan"]),
];

describe("renderPlanUpdate", () => {
	it("marks a phase kept in place as unchanged", () => {
		const body = renderPlanUpdate(makeBacklogItem({ plan: threePhasePlan }), [
			payload("Read the payload", ["Parse the JSON"]),
			payload("Render the pane", ["Render the phases"], ["Open the pane"]),
			payload("Wire the command", ["Register update-plan"]),
		]);

		expect(body).toContain("### Phase 1: Read the payload (unchanged)");
		expect(body).toContain("### Phase 2: Render the pane (unchanged)");
		expect(body).toContain("### Phase 3: Wire the command (unchanged)");
		expect(body).not.toContain("## Removed phases");
	});

	it("marks a phase the payload introduces as added", () => {
		const body = renderPlanUpdate(makeBacklogItem({ plan: threePhasePlan }), [
			payload("Read the payload", ["Parse the JSON"]),
			payload("Render the pane", ["Render the phases"], ["Open the pane"]),
			payload("Wire the command", ["Register update-plan"]),
			payload("Document it", ["Update the README"]),
		]);

		expect(body).toContain("### Phase 4: Document it (added)");
		expect(body).toContain("- Update the README");
	});

	it("lists a dropped phase under removed phases at its old position", () => {
		const body = renderPlanUpdate(makeBacklogItem({ plan: threePhasePlan }), [
			payload("Read the payload", ["Parse the JSON"]),
			payload("Wire the command", ["Register update-plan"]),
		]);

		expect(body).toContain("### Phase 1: Read the payload (unchanged)");
		expect(body).toContain(
			"### Phase 2: Wire the command (moved from phase 3)",
		);
		expect(body).toContain("## Removed phases");
		expect(body).toContain("### Phase 2: Render the pane (removed)");
	});

	it("marks a phase that only changed position as moved", () => {
		const body = renderPlanUpdate(makeBacklogItem({ plan: threePhasePlan }), [
			payload("Wire the command", ["Register update-plan"]),
			payload("Read the payload", ["Parse the JSON"]),
			payload("Render the pane", ["Render the phases"], ["Open the pane"]),
		]);

		expect(body).toContain(
			"### Phase 1: Wire the command (moved from phase 3)",
		);
		expect(body).toContain(
			"### Phase 2: Read the payload (moved from phase 1)",
		);
		expect(body).toContain("### Phase 3: Render the pane (moved from phase 2)");
		expect(body).not.toContain("edited");
		expect(body).not.toContain("## Removed phases");
	});

	it("marks a rewritten phase as edited and shows the tasks it replaces", () => {
		const body = renderPlanUpdate(makeBacklogItem({ plan: threePhasePlan }), [
			payload("Read the payload", ["Parse the JSON"]),
			payload("Render the pane", ["Render the diff", "Await approval"]),
			payload("Wire the command", ["Register update-plan"]),
		]);

		expect(body).toContain("### Phase 2: Render the pane (edited)");
		expect(body).toContain("- Render the diff");
		expect(body).toContain("**Previously:**");
		expect(body).toContain("- Render the phases");
	});

	it("reports a phase that was both rewritten and reordered as edited and moved", () => {
		const body = renderPlanUpdate(makeBacklogItem({ plan: threePhasePlan }), [
			payload("Wire the command", ["Register update-plan", "Document it"]),
			payload("Read the payload", ["Parse the JSON"]),
			payload("Render the pane", ["Render the phases"], ["Open the pane"]),
		]);

		expect(body).toContain(
			"### Phase 1: Wire the command (edited, moved from phase 3)",
		);
	});

	it("reports a renamed phase as edited rather than added and removed", () => {
		const body = renderPlanUpdate(makeBacklogItem({ plan: threePhasePlan }), [
			payload("Read the payload", ["Parse the JSON"]),
			payload("Render the diff", ["Render the phases"], ["Open the pane"]),
			payload("Wire the command", ["Register update-plan"]),
		]);

		expect(body).toContain(
			'### Phase 2: Render the diff (edited, renamed from "Render the pane")',
		);
		expect(body).not.toContain("## Removed phases");
	});

	it("flags a rewrite of a completed phase", () => {
		const body = renderPlanUpdate(
			makeBacklogItem({ plan: threePhasePlan, currentPhase: 3 }),
			[
				payload("Read the payload", ["Parse the JSON", "Validate the phases"]),
				payload("Render the pane", ["Render the phases"], ["Open the pane"]),
				payload("Wire the command", ["Register update-plan"]),
			],
		);

		expect(body).toContain(
			"### Phase 1: Read the payload (edited, already completed)",
		);
		expect(body).toContain("**Previously:**");
	});

	it("flags a phase removed from behind currentPhase", () => {
		const body = renderPlanUpdate(
			makeBacklogItem({ plan: threePhasePlan, currentPhase: 3 }),
			[
				payload("Render the pane", ["Render the phases"], ["Open the pane"]),
				payload("Wire the command", ["Register update-plan"]),
			],
		);

		expect(body).toContain(
			"### Phase 1: Read the payload (removed, already completed)",
		);
		expect(body).toContain("**Current phase:** 3 → 2");
	});

	it("marks every phase as added when the item has no plan yet", () => {
		const body = renderPlanUpdate(makeBacklogItem({ plan: [] }), [
			payload("Read the payload", ["Parse the JSON"]),
		]);

		expect(body).toContain("### Phase 1: Read the payload (added)");
		expect(body).not.toContain("## Removed phases");
	});
});
