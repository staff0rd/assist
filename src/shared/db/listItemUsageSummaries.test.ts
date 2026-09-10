import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { itemUsageStats } from "./itemUsageStats";
import { listItemUsageSummaries } from "./listItemUsageSummaries";
import { items, phaseSessions, phaseUsage, planPhases } from "./schema";

describe("listItemUsageSummaries", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeAll(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await orm.delete(phaseUsage);
		await orm.delete(phaseSessions);
		await orm.delete(planPhases);
		await orm.delete(items);
	});

	afterAll(async () => {
		await close();
	});

	const addItem = (
		id: number,
		overrides: Partial<typeof items.$inferInsert> = {},
	) =>
		orm.insert(items).values({
			id,
			origin: "github.com/acme/assist",
			name: `Item ${id}`,
			...overrides,
		});

	const addPhases = (itemId: number, count: number) =>
		orm.insert(planPhases).values(
			Array.from({ length: count }, (_, idx) => ({
				itemId,
				idx,
				name: `Phase ${idx + 1}`,
			})),
		);

	const addUsage = (
		itemId: number,
		phaseIdx: number,
		usage: {
			tokensUp: number;
			tokensDown: number;
			activeMs: number;
			peakContextPct: number;
		},
	) => orm.insert(phaseUsage).values({ itemId, phaseIdx, ...usage });

	const addSession = (itemId: number, phaseIdx: number, createdAt: string) =>
		orm.insert(phaseSessions).values({
			itemId,
			phaseIdx,
			claudeSessionId: `${itemId}-${phaseIdx}`,
			hostname: "host",
			osUser: "user",
			createdAt: new Date(createdAt),
		});

	describe("when nothing has recorded usage", () => {
		it("returns no rows and counts zero", async () => {
			await addItem(1);

			expect(await listItemUsageSummaries(orm)).toEqual([]);
			expect((await itemUsageStats(orm)).itemCount).toBe(0);
		});
	});

	describe("when an item recorded usage across several phases", () => {
		it("sums tokens and active time, peaks context and counts phases", async () => {
			await addItem(1, { type: "bug", status: "done" });
			await addPhases(1, 3);
			await addUsage(1, 0, {
				tokensUp: 1_000,
				tokensDown: 100,
				activeMs: 60_000,
				peakContextPct: 42,
			});
			await addUsage(1, 1, {
				tokensUp: 2_000,
				tokensDown: 300,
				activeMs: 120_000,
				peakContextPct: 71,
			});
			await addSession(1, 0, "2026-09-01T10:00:00Z");
			await addSession(1, 1, "2026-09-02T11:00:00Z");

			expect(await listItemUsageSummaries(orm)).toEqual([
				{
					id: 1,
					origin: "github.com/acme/assist",
					type: "bug",
					name: "Item 1",
					status: "done",
					phaseCount: 3,
					recordedPhases: 2,
					tokensUp: 3_000,
					tokensDown: 400,
					activeMs: 180_000,
					peakContextPct: 71,
					lastPhaseAt: "2026-09-02T11:00:00.000Z",
				},
			]);
			expect((await itemUsageStats(orm)).itemCount).toBe(1);
		});
	});

	describe("when an item has usage but no plan or sessions", () => {
		it("reports no planned phases and no last activity", async () => {
			await addItem(7);
			await addUsage(7, 0, {
				tokensUp: 5,
				tokensDown: 6,
				activeMs: 7,
				peakContextPct: 8,
			});

			const [row] = await listItemUsageSummaries(orm);
			expect(row?.phaseCount).toBe(0);
			expect(row?.recordedPhases).toBe(1);
			expect(row?.lastPhaseAt).toBeNull();
		});
	});

	describe("when several items recorded usage", () => {
		const seed = async () => {
			for (const [id, at] of [
				[1, "2026-09-01T00:00:00Z"],
				[2, "2026-09-03T00:00:00Z"],
				[3, "2026-09-02T00:00:00Z"],
			] as const) {
				await addItem(id);
				await addUsage(id, 0, {
					tokensUp: id,
					tokensDown: id,
					activeMs: id,
					peakContextPct: id,
				});
				await addSession(id, 0, at);
			}
			await addItem(4);
			await addUsage(4, 0, {
				tokensUp: 4,
				tokensDown: 4,
				activeMs: 4,
				peakContextPct: 4,
			});
		};

		it("orders by last phase activity, newest first, untracked items last", async () => {
			await seed();

			const rows = await listItemUsageSummaries(orm);

			expect(rows.map((r) => r.id)).toEqual([2, 3, 1, 4]);
		});

		it("pages within that order and counts every item with usage", async () => {
			await seed();

			const page0 = await listItemUsageSummaries(orm, { limit: 2, offset: 0 });
			const page1 = await listItemUsageSummaries(orm, { limit: 2, offset: 2 });

			expect(page0.map((r) => r.id)).toEqual([2, 3]);
			expect(page1.map((r) => r.id)).toEqual([1, 4]);
			expect((await itemUsageStats(orm)).itemCount).toBe(4);
		});
	});

	describe("when items span several repos", () => {
		it("keeps only the requested origin", async () => {
			await addItem(1, { origin: "github.com/acme/assist" });
			await addItem(2, { origin: "github.com/acme/apm" });
			for (const id of [1, 2]) {
				await addUsage(id, 0, {
					tokensUp: id,
					tokensDown: id,
					activeMs: id,
					peakContextPct: id,
				});
			}

			const rows = await listItemUsageSummaries(orm, {
				origin: "github.com/acme/apm",
			});

			expect(rows.map((r) => r.id)).toEqual([2]);
		});
	});
});
