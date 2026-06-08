import { describe, expect, it } from "vitest";
import type { BacklogItem, PlanPhase } from "../types";
import { canPlay } from "./canPlay";

const plan: PlanPhase[] = [{ name: "Phase 1", tasks: [{ task: "do it" }] }];

function item(overrides: Partial<BacklogItem> = {}): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "Example",
		acceptanceCriteria: [],
		status: "todo",
		plan,
		...overrides,
	};
}

describe("canPlay", () => {
	it("is playable when status is todo and a plan exists", () => {
		expect(canPlay(item())).toBe(true);
	});

	it("is not playable while in-progress (button hides once a run starts)", () => {
		expect(canPlay(item({ status: "in-progress" }))).toBe(false);
	});

	it("is not playable when done", () => {
		expect(canPlay(item({ status: "done" }))).toBe(false);
	});

	it("is not playable when wontdo", () => {
		expect(canPlay(item({ status: "wontdo" }))).toBe(false);
	});

	it("is not playable when the plan is undefined", () => {
		expect(canPlay(item({ plan: undefined }))).toBe(false);
	});

	it("is not playable when the plan is empty", () => {
		expect(canPlay(item({ plan: [] }))).toBe(false);
	});
});
