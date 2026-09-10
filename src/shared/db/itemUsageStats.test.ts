import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { countItemUsageByOrigin } from "./countItemUsageByOrigin";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { itemUsageStats } from "./itemUsageStats";
import { items, phaseUsage, planPhases } from "./schema";

describe("itemUsageStats", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeAll(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await orm.delete(phaseUsage);
		await orm.delete(planPhases);
		await orm.delete(items);
	});

	afterAll(async () => {
		await close();
	});

	const addItem = async (
		id: number,
		spec: {
			origin?: string;
			status?: string;
			plannedPhases?: number;
			activeMs: number;
			tokens: number;
		},
	) => {
		await orm.insert(items).values({
			id,
			origin: spec.origin ?? "github.com/acme/assist",
			name: `Item ${id}`,
			status: spec.status ?? "done",
		});
		if (spec.plannedPhases !== undefined) {
			await orm.insert(planPhases).values(
				Array.from({ length: spec.plannedPhases }, (_, idx) => ({
					itemId: id,
					idx,
					name: `Phase ${idx + 1}`,
				})),
			);
		}
		await orm.insert(phaseUsage).values({
			itemId: id,
			phaseIdx: 0,
			tokensUp: spec.tokens,
			tokensDown: 0,
			activeMs: spec.activeMs,
		});
	};

	describe("when nothing has recorded usage", () => {
		it("reports zeroes rather than nulls", async () => {
			expect(await itemUsageStats(orm)).toEqual({
				itemCount: 0,
				doneCount: 0,
				repoCount: 0,
				medianPhases: 0,
				medianActiveMs: 0,
				medianTokens: 0,
			});
		});
	});

	describe("when an odd number of items recorded usage", () => {
		it("takes the middle item for each median", async () => {
			await addItem(1, { plannedPhases: 2, activeMs: 60_000, tokens: 100 });
			await addItem(2, { plannedPhases: 3, activeMs: 120_000, tokens: 220 });
			await addItem(3, {
				plannedPhases: 5,
				activeMs: 300_000,
				tokens: 550,
				status: "in-progress",
			});

			expect(await itemUsageStats(orm)).toEqual({
				itemCount: 3,
				doneCount: 2,
				repoCount: 1,
				medianPhases: 3,
				medianActiveMs: 120_000,
				medianTokens: 220,
			});
		});
	});

	describe("when an even number of items recorded usage", () => {
		it("interpolates between the two middle items", async () => {
			await addItem(1, { plannedPhases: 2, activeMs: 60_000, tokens: 100 });
			await addItem(2, { plannedPhases: 5, activeMs: 120_000, tokens: 300 });

			const stats = await itemUsageStats(orm);

			expect(stats.medianPhases).toBe(3.5);
			expect(stats.medianActiveMs).toBe(90_000);
			expect(stats.medianTokens).toBe(200);
		});
	});

	describe("when an item has usage but no authored plan", () => {
		it("counts its recorded phases towards the phase median", async () => {
			await addItem(1, { activeMs: 60_000, tokens: 100 });

			expect((await itemUsageStats(orm)).medianPhases).toBe(1);
		});
	});

	describe("when items differ in status", () => {
		const seed = async () => {
			await addItem(1, { plannedPhases: 2, activeMs: 60_000, tokens: 100 });
			await addItem(2, {
				plannedPhases: 6,
				activeMs: 600_000,
				tokens: 900,
				status: "in-progress",
			});
			await addItem(3, {
				plannedPhases: 4,
				activeMs: 240_000,
				tokens: 400,
				status: "todo",
			});
		};

		it("medians only the done items", async () => {
			await seed();

			expect(await itemUsageStats(orm, { status: "done" })).toEqual({
				itemCount: 1,
				doneCount: 1,
				repoCount: 1,
				medianPhases: 2,
				medianActiveMs: 60_000,
				medianTokens: 100,
			});
		});

		it("medians every item that is not done as running", async () => {
			await seed();

			const stats = await itemUsageStats(orm, { status: "running" });

			expect(stats.itemCount).toBe(2);
			expect(stats.doneCount).toBe(0);
			expect(stats.medianPhases).toBe(5);
			expect(stats.medianActiveMs).toBe(420_000);
			expect(stats.medianTokens).toBe(650);
		});
	});

	describe("when items span several repos", () => {
		const seed = async () => {
			await addItem(1, { plannedPhases: 2, activeMs: 60_000, tokens: 100 });
			await addItem(2, { plannedPhases: 6, activeMs: 600_000, tokens: 900 });
			await addItem(3, {
				origin: "github.com/acme/apm",
				plannedPhases: 4,
				activeMs: 240_000,
				tokens: 400,
				status: "in-progress",
			});
		};

		it("counts every repo when unfiltered", async () => {
			await seed();

			const stats = await itemUsageStats(orm);

			expect(stats).toEqual({
				itemCount: 3,
				doneCount: 2,
				repoCount: 2,
				medianPhases: 4,
				medianActiveMs: 240_000,
				medianTokens: 400,
			});
		});

		it("narrows every figure to the requested origin", async () => {
			await seed();

			const stats = await itemUsageStats(orm, {
				origin: "github.com/acme/assist",
			});

			expect(stats).toEqual({
				itemCount: 2,
				doneCount: 2,
				repoCount: 1,
				medianPhases: 4,
				medianActiveMs: 330_000,
				medianTokens: 500,
			});
		});

		it("counts the items each repo contributed", async () => {
			await seed();

			expect(await countItemUsageByOrigin(orm)).toEqual([
				{ origin: "github.com/acme/assist", count: 2 },
				{ origin: "github.com/acme/apm", count: 1 },
			]);
		});
	});
});
