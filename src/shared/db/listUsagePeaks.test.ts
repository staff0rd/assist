import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { listUsagePeaks } from "./listUsagePeaks";
import { recordUsagePeak } from "./recordUsagePeak";

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
				{ window: "five_hour", resetsAt: 3000, usedPercentage: 20 },
				{ window: "seven_day", resetsAt: 2000, usedPercentage: 30 },
				{ window: "five_hour", resetsAt: 1000, usedPercentage: 10 },
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
				{ window: "five_hour", resetsAt: 5000, usedPercentage: 40 },
				{ window: "seven_day", resetsAt: 5000, usedPercentage: 60 },
			]);
		});
	});
});
