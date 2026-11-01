import { describe, expect, it } from "vitest";
import { makeBacklogItem } from "../../test/mothers/makeBacklogItem";
import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";
import { provisionalRunActivity } from "./provisionalRunActivity";

const plan = [
	{ name: "Build API", tasks: [] },
	{ name: "Wire UI", tasks: [] },
];

describe("provisionalRunActivity", () => {
	it("starts a fresh item at its first phase", () => {
		const item = makeBacklogItem({ id: 7, name: "Story", plan });

		expect(provisionalRunActivity(item)).toEqual({
			kind: "backlog",
			itemId: 7,
			itemName: "Story",
			phase: 1,
			phaseName: "Build API",
			totalPhases: 3,
		});
	});

	it("resumes at the item's current mid-plan phase", () => {
		const item = makeBacklogItem({ plan, currentPhase: 2 });

		expect(provisionalRunActivity(item)).toMatchObject({
			phase: 2,
			phaseName: "Wire UI",
			totalPhases: 3,
		});
	});

	it("labels the review phase as the last of totalPhases", () => {
		const item = makeBacklogItem({ plan, currentPhase: 3 });

		expect(provisionalRunActivity(item)).toMatchObject({
			phase: 3,
			phaseName: REVIEW_PHASE_NAME,
			totalPhases: 3,
		});
	});

	it("falls back to the single Implement phase without a plan", () => {
		expect(provisionalRunActivity(makeBacklogItem())).toMatchObject({
			phase: 1,
			phaseName: "Implement",
			totalPhases: 2,
		});
	});

	it("returns nothing for a done item or one past its review", () => {
		expect(
			provisionalRunActivity(makeBacklogItem({ plan, status: "done" })),
		).toBeUndefined();
		expect(
			provisionalRunActivity(makeBacklogItem({ plan, currentPhase: 4 })),
		).toBeUndefined();
	});
});
