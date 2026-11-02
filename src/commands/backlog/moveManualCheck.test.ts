import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items, planPhases } from "../../shared/db/schema";
import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";
import { loadItem } from "./loadItem";
import { moveManualCheck } from "./moveManualCheck";
import { resolveRewindPlan } from "./resolveRewindPlan";

let orm: Db;
let close: () => Promise<void>;

async function item() {
	const loaded = await loadItem(orm, 1);
	if (!loaded) throw new Error("missing item");
	return loaded;
}

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	await orm
		.insert(items)
		.values({ id: 1, origin: "test", name: "Test", currentPhase: 1 });
	await orm.insert(planPhases).values([
		{ itemId: 1, idx: 0, name: "A", manualChecks: '["a1","a2"]' },
		{ itemId: 1, idx: 1, name: "B", manualChecks: '["b1"]' },
	]);
});

afterEach(async () => {
	await close();
});

describe("moveManualCheck", () => {
	it("moves a check to the end of a later authored phase", async () => {
		await moveManualCheck(orm, await item(), 0, 0, 1);

		const plan = (await item()).plan ?? [];
		expect(plan[0].manualChecks).toEqual(["a2"]);
		expect(plan[1].manualChecks).toEqual(["b1", "a1"]);
	});

	it("stores a Review phase holding the check when Review is the target", async () => {
		await moveManualCheck(orm, await item(), 0, 1, 2);

		const moved = await item();
		expect(moved.plan?.map((p) => p.name)).toEqual(["A", "B", "Review"]);
		expect(moved.plan?.[2].manualChecks).toEqual(["a2"]);
		const full = resolveRewindPlan(moved);
		expect(full.map((p) => p.name)).toEqual(["A", "B", REVIEW_PHASE_NAME]);
		expect(full[2].manualChecks).toEqual(["a2"]);
	});

	it("appends to an already stored Review phase", async () => {
		await moveManualCheck(orm, await item(), 0, 0, 2);
		await moveManualCheck(orm, await item(), 0, 0, 2);

		const moved = await item();
		expect(moved.plan?.[0].manualChecks).toBeUndefined();
		expect(moved.plan?.[2].manualChecks).toEqual(["a1", "a2"]);
	});
});
