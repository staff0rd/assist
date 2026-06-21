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
			.orderBy(usagePeaks.window, usagePeaks.resetsAt, usagePeaks.segment);

	describe("when a window is recorded for the first time", () => {
		it("inserts the peak keyed by window and reset time", async () => {
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 42, resets_at: 1000 },
			});

			expect(await peaks()).toEqual([
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 42,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
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
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 10,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
				{
					window: "seven_day",
					resetsAt: 5000,
					segment: 0,
					usedPercentage: 20,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
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
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 75,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
			]);
		});
	});

	describe("when a marginally lower percentage arrives for the same cycle", () => {
		it("keeps the previous maximum and flags no reset", async () => {
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 80, resets_at: 1000 },
			});
			await recordUsagePeak(orm, {
				five_hour: { used_percentage: 79.5, resets_at: 1000 },
			});

			expect(await peaks()).toEqual([
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 80,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
			]);
		});
	});

	describe("when usage drops sharply mid-cycle (a quota reset)", () => {
		it("preserves the pre-reset peak and opens a new segment for the post-reset value", async () => {
			await recordUsagePeak(orm, {
				seven_day: { used_percentage: 35, resets_at: 1000 },
			});
			await recordUsagePeak(orm, {
				seven_day: { used_percentage: 8, resets_at: 1000 },
			});

			expect(await peaks()).toEqual([
				{
					window: "seven_day",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 35,
					resetDetected: true,
					createdAt: expect.any(Date),
				},
				{
					window: "seven_day",
					resetsAt: 1000,
					segment: 1,
					usedPercentage: 8,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
			]);
		});

		it("climbs the post-reset segment while the pre-reset peak stays put", async () => {
			await recordUsagePeak(orm, {
				seven_day: { used_percentage: 35, resets_at: 1000 },
			});
			await recordUsagePeak(orm, {
				seven_day: { used_percentage: 8, resets_at: 1000 },
			});
			await recordUsagePeak(orm, {
				seven_day: { used_percentage: 12, resets_at: 1000 },
			});

			expect(await peaks()).toEqual([
				{
					window: "seven_day",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 35,
					resetDetected: true,
					createdAt: expect.any(Date),
				},
				{
					window: "seven_day",
					resetsAt: 1000,
					segment: 1,
					usedPercentage: 12,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
			]);
		});

		it("opens a further segment when a second reset hits the same cycle", async () => {
			await recordUsagePeak(orm, {
				seven_day: { used_percentage: 35, resets_at: 1000 },
			});
			await recordUsagePeak(orm, {
				seven_day: { used_percentage: 8, resets_at: 1000 },
			});
			await recordUsagePeak(orm, {
				seven_day: { used_percentage: 2, resets_at: 1000 },
			});

			expect(await peaks()).toEqual([
				{
					window: "seven_day",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 35,
					resetDetected: true,
					createdAt: expect.any(Date),
				},
				{
					window: "seven_day",
					resetsAt: 1000,
					segment: 1,
					usedPercentage: 8,
					resetDetected: true,
					createdAt: expect.any(Date),
				},
				{
					window: "seven_day",
					resetsAt: 1000,
					segment: 2,
					usedPercentage: 2,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
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
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 90,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
				{
					window: "five_hour",
					resetsAt: 2000,
					segment: 0,
					usedPercentage: 15,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
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
				{
					window: "seven_day",
					resetsAt: 5000,
					segment: 0,
					usedPercentage: 20,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
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
