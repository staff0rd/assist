import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { countUsagePeaks, listUsagePeaks } from "./listUsagePeaks";
import { recordPhaseCycleContext } from "./recordPhaseCycleContext";
import { recordUsagePeak } from "./recordUsagePeak";
import { items } from "./schema";

describe("listUsagePeaks", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	describe("when no peaks have been recorded", () => {
		it("returns an empty list", async () => {
			expect(await listUsagePeaks(orm)).toEqual([]);
		});
	});

	describe("when peaks span several cycles", () => {
		it("returns them newest cycle first", async () => {
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 10, resets_at: 1000 },
			});
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 20, resets_at: 3000 },
			});
			await recordUsagePeak(orm, {
				seven_day: { used_percentage: 30, resets_at: 2000 },
			});

			expect(await listUsagePeaks(orm)).toEqual([
				{
					window: "five_hour",
					resetsAt: 3000,
					segment: 0,
					usedPercentage: 20,
					resetDetected: false,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					createdAt: expect.any(Date),
				},
				{
					window: "seven_day",
					resetsAt: 2000,
					segment: 0,
					usedPercentage: 30,
					resetDetected: false,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					createdAt: expect.any(Date),
				},
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 10,
					resetDetected: false,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					createdAt: expect.any(Date),
				},
			]);
		});
	});

	describe("when a cycle was reset mid-window", () => {
		it("returns the post-reset continuation before its pre-reset peak", async () => {
			await recordUsagePeak(orm, {
				seven_day: { used_percentage: 35, resets_at: 2000 },
			});
			await recordUsagePeak(orm, {
				seven_day: { used_percentage: 8, resets_at: 2000 },
			});

			expect(await listUsagePeaks(orm)).toEqual([
				{
					window: "seven_day",
					resetsAt: 2000,
					segment: 1,
					usedPercentage: 8,
					resetDetected: false,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					createdAt: expect.any(Date),
				},
				{
					window: "seven_day",
					resetsAt: 2000,
					segment: 0,
					usedPercentage: 35,
					resetDetected: true,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					createdAt: expect.any(Date),
				},
			]);
		});
	});

	describe("when both windows share a reset time", () => {
		it("orders them by window for a deterministic result", async () => {
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 40, resets_at: 5000 },
				seven_day: { used_percentage: 60, resets_at: 5000 },
			});

			expect(await listUsagePeaks(orm)).toEqual([
				{
					window: "five_hour",
					resetsAt: 5000,
					segment: 0,
					usedPercentage: 40,
					resetDetected: false,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					createdAt: expect.any(Date),
				},
				{
					window: "seven_day",
					resetsAt: 5000,
					segment: 0,
					usedPercentage: 60,
					resetDetected: false,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					createdAt: expect.any(Date),
				},
			]);
		});
	});

	describe("when paging", () => {
		beforeEach(async () => {
			for (const resets_at of [1000, 2000, 3000, 4000, 5000]) {
				await recordUsagePeak(orm, {
					five_hour: { used_percentage: resets_at / 100, resets_at },
				});
			}
		});

		it("returns the requested slice in the deterministic order", async () => {
			const page0 = await listUsagePeaks(orm, { limit: 2, offset: 0 });
			const page1 = await listUsagePeaks(orm, { limit: 2, offset: 2 });
			const page2 = await listUsagePeaks(orm, { limit: 2, offset: 4 });

			expect(page0.map((r) => r.resetsAt)).toEqual([5000, 4000]);
			expect(page1.map((r) => r.resetsAt)).toEqual([3000, 2000]);
			expect(page2.map((r) => r.resetsAt)).toEqual([1000]);
		});

		it("counts every recorded peak", async () => {
			expect(await countUsagePeaks(orm)).toBe(5);
		});
	});

	describe("when no peaks have been recorded", () => {
		it("counts zero", async () => {
			expect(await countUsagePeaks(orm)).toBe(0);
		});
	});

	describe("avg context per cycle", () => {
		beforeEach(async () => {
			await orm.insert(items).values({ id: 1, origin: "test", name: "Item" });
		});

		it("reports the mean of the cycle's per-phase peaks", async () => {
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 40, resets_at: 1000 },
			});
			await recordPhaseCycleContext(orm, 1, 0, "five_hour", 1000, 30);
			await recordPhaseCycleContext(orm, 1, 1, "five_hour", 1000, 50);

			const [row] = await listUsagePeaks(orm);
			expect(row?.avgContextPct).toBe(40);
		});

		it("leaves avgContextPct null for a cycle with no readings", async () => {
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 40, resets_at: 1000 },
			});

			const [row] = await listUsagePeaks(orm);
			expect(row?.avgContextPct).toBeNull();
		});
	});
});
