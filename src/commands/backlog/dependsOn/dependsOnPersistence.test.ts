import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../../shared/db/createTestDb";
import type { Db } from "../../../shared/db/Db";
import { items } from "../../../shared/db/schema";

vi.mock("../shared", () => ({ findOneItem: vi.fn() }));

import { insertPhaseAt } from "../insertPhaseAt";
import { removePhase } from "../removePhase";
import { reorderPhaseRows } from "../reorderPhaseRows";
import { findOneItem } from "../shared";
import { replacePlan } from "../updatePlan/replacePlan";
import { loadStoredDependsOn } from "./loadStoredDependsOn";

let orm: Db;
let close: () => Promise<void>;

async function seedPlan(dependsOn: (number[] | undefined)[]): Promise<void> {
	await orm
		.insert(items)
		.values({ id: 1, origin: "test", name: "Test", status: "todo" });
	await replacePlan(
		orm,
		1,
		dependsOn.map((deps, i) => ({
			name: `P${i + 1}`,
			tasks: ["t"],
			manualChecks: [],
			...(deps ? { dependsOn: deps } : {}),
		})),
		undefined,
	);
}

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	vi.mocked(findOneItem).mockImplementation(
		async () =>
			({
				orm,
				item: { id: 1 },
			}) as never,
	);
	vi.spyOn(console, "log").mockImplementation(() => undefined);
});

afterEach(async () => {
	await close();
	vi.restoreAllMocks();
});

describe("phase dependency persistence", () => {
	it("stores only dependencies that differ from the previous phase", async () => {
		await seedPlan([undefined, [1], [1], [2]]);
		expect(await loadStoredDependsOn(orm, 1)).toEqual([null, null, [0], [1]]);
	});

	it("keeps references on their phases when a phase is inserted before them", async () => {
		await seedPlan([undefined, undefined, [1], [2]]);
		await insertPhaseAt(orm, 1, 1, "New", ["t"], null, undefined);
		expect(await loadStoredDependsOn(orm, 1)).toEqual([
			null,
			null,
			null,
			[0],
			[2],
		]);
	});

	it("re-points references to a removed phase at its own dependency", async () => {
		await seedPlan([undefined, undefined, [2], [2]]);
		await removePhase("1", "2");
		expect(await loadStoredDependsOn(orm, 1)).toEqual([null, null, [0]]);
	});

	it("follows a moved phase to its new position", async () => {
		await seedPlan([undefined, undefined, [1], [2]]);
		await reorderPhaseRows(orm, 1, 0, 1);
		expect(await loadStoredDependsOn(orm, 1)).toEqual([null, null, null, [0]]);
	});
});
