import type { PGlite } from "@electric-sql/pglite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../createTestDb";
import type { Db } from "../Db";
import { listUsagePeaks } from "../listUsagePeaks";
import { items, phaseCycleContext, usagePeaks } from "../schema";
import { migration0014MergeJitteredCycles } from "./migration0014MergeJitteredCycles";

describe("migration0014MergeJitteredCycles", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		await orm.insert(items).values({ id: 1, origin: "test", name: "Item" });
	});

	afterEach(async () => {
		await close();
	});

	const CYCLE = 1795178696;
	const NEXT = CYCLE + 7 * 24 * 60 * 60;
	const migrate = () =>
		(orm as unknown as { $client: PGlite }).$client.exec(
			migration0014MergeJitteredCycles.sql,
		);

	const seed = async () => {
		await orm.insert(usagePeaks).values([
			{
				window: "codex:seven_day",
				resetsAt: CYCLE,
				usedPercentage: 10,
				tokensUp: 11_800,
				tokensDown: 103_500,
				createdAt: new Date("2026-11-14T00:00:00Z"),
			},
			{
				window: "codex:seven_day",
				resetsAt: CYCLE + 1,
				usedPercentage: 12,
				tokensUp: 45_900,
				tokensDown: 396_900,
				createdAt: new Date("2026-11-15T00:00:00Z"),
			},
			{
				window: "codex:seven_day",
				resetsAt: CYCLE + 90,
				usedPercentage: 0,
			},
			{ window: "codex:seven_day", resetsAt: NEXT, usedPercentage: 3 },
			{ window: "seven_day", resetsAt: CYCLE + 1, usedPercentage: 50 },
		]);
		await orm.insert(phaseCycleContext).values([
			{
				itemId: 1,
				phaseIdx: 0,
				window: "codex:seven_day",
				resetsAt: CYCLE,
				peakContextPct: 16,
			},
			{
				itemId: 1,
				phaseIdx: 0,
				window: "codex:seven_day",
				resetsAt: CYCLE + 1,
				peakContextPct: 19,
			},
			{
				itemId: 1,
				phaseIdx: 1,
				window: "codex:seven_day",
				resetsAt: CYCLE + 1,
				peakContextPct: 22,
			},
			{
				itemId: 1,
				phaseIdx: 2,
				window: "codex:seven_day",
				resetsAt: CYCLE + 120,
				peakContextPct: 8,
			},
		]);
	};

	it("merges near-identical cycles, summing tokens and keeping the higher peak", async () => {
		await seed();
		await migrate();

		const rows = await listUsagePeaks(orm, { window: "codex:seven_day" });
		expect(
			rows.map((r) => ({
				resetsAt: r.resetsAt,
				usedPercentage: r.usedPercentage,
				tokensUp: r.tokensUp,
				tokensDown: r.tokensDown,
				createdAt: r.createdAt,
				phaseCount: r.phaseCount,
				avgContextPct: r.avgContextPct,
			})),
		).toEqual([
			{
				resetsAt: NEXT,
				usedPercentage: 3,
				tokensUp: 0,
				tokensDown: 0,
				createdAt: expect.any(Date),
				phaseCount: null,
				avgContextPct: null,
			},
			{
				resetsAt: CYCLE,
				usedPercentage: 12,
				tokensUp: 57_700,
				tokensDown: 500_400,
				createdAt: new Date("2026-11-14T00:00:00Z"),
				phaseCount: 3,
				avgContextPct: 49 / 3,
			},
		]);
	});

	it("leaves other windows and distinct cycles alone, and re-runs as a no-op", async () => {
		await seed();
		await migrate();
		const once = await listUsagePeaks(orm);
		await migrate();

		expect(await listUsagePeaks(orm)).toEqual(once);
		expect(
			once.filter((r) => r.window === "seven_day").map((r) => r.resetsAt),
		).toEqual([CYCLE + 1]);
	});
});
