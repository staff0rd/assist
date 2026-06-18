import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { recordUsagePeak } from "./recordUsagePeak";
import { usagePeaks } from "./schema";

describe("recordUsagePeak", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	const peaks = () =>
		orm
			.select()
			.from(usagePeaks)
			.orderBy(usagePeaks.window, usagePeaks.resetsAt);

	describe("when a window is recorded for the first time", () => {
		it("inserts the peak keyed by window and reset time", async () => {
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 42, resets_at: 1000 },
			});

			expect(await peaks()).toEqual([
				{ window: "five_hour", resetsAt: 1000, usedPercentage: 42 },
			]);
		});
	});

	describe("when both windows are present", () => {
		it("records a row per window", async () => {
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 10, resets_at: 1000 },
				seven_day: { used_percentage: 20, resets_at: 5000 },
			});

			expect(await peaks()).toEqual([
				{ window: "five_hour", resetsAt: 1000, usedPercentage: 10 },
				{ window: "seven_day", resetsAt: 5000, usedPercentage: 20 },
			]);
		});
	});

	describe("when a higher percentage arrives for the same cycle", () => {
		it("keeps the higher percentage", async () => {
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 30, resets_at: 1000 },
			});
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 75, resets_at: 1000 },
			});

			expect(await peaks()).toEqual([
				{ window: "five_hour", resetsAt: 1000, usedPercentage: 75 },
			]);
		});
	});

	describe("when a lower percentage arrives for the same cycle", () => {
		it("keeps the previous maximum", async () => {
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 80, resets_at: 1000 },
			});
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 25, resets_at: 1000 },
			});

			expect(await peaks()).toEqual([
				{ window: "five_hour", resetsAt: 1000, usedPercentage: 80 },
			]);
		});
	});

	describe("when the same window resets to a new cycle", () => {
		it("tracks each cycle separately", async () => {
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 90, resets_at: 1000 },
			});
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 15, resets_at: 2000 },
			});

			expect(await peaks()).toEqual([
				{ window: "five_hour", resetsAt: 1000, usedPercentage: 90 },
				{ window: "five_hour", resetsAt: 2000, usedPercentage: 15 },
			]);
		});
	});

	describe("when a window is missing its reset time", () => {
		it("skips that window", async () => {
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 50 },
				seven_day: { used_percentage: 20, resets_at: 5000 },
			});

			expect(await peaks()).toEqual([
				{ window: "seven_day", resetsAt: 5000, usedPercentage: 20 },
			]);
		});
	});

	describe("when a window is missing its used percentage", () => {
		it("skips that window", async () => {
			await recordUsagePeak(orm, {
				five_hour: { resets_at: 1000 },
			});

			expect(await peaks()).toEqual([]);
		});
	});

	describe("when no windows carry usable data", () => {
		it("records nothing", async () => {
			await recordUsagePeak(orm, {});

			expect(await peaks()).toEqual([]);
		});
	});
});
