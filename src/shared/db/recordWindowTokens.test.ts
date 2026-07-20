import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RateLimits } from "../RateLimits";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { recordUsagePeak } from "./recordUsagePeak";
import { recordWindowTokens } from "./recordWindowTokens";
import { usagePeaks } from "./schema";

describe("recordWindowTokens", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	const NOW = 100;
	const record = (rateLimits: RateLimits) =>
		recordUsagePeak(orm, rateLimits, NOW);

	const tokens = () =>
		orm
			.select({
				segment: usagePeaks.segment,
				usedPercentage: usagePeaks.usedPercentage,
				resetDetected: usagePeaks.resetDetected,
				tokensUp: usagePeaks.tokensUp,
				tokensDown: usagePeaks.tokensDown,
			})
			.from(usagePeaks)
			.orderBy(usagePeaks.segment);

	it("accumulates the delta onto the cycle's base segment", async () => {
		await record({
			five_hour: { used_percentage: 40, resets_at: 1000 },
		});

		await recordWindowTokens(orm, "five_hour", 1000, 100, 300);
		await recordWindowTokens(orm, "five_hour", 1000, 50, 150);

		expect(await tokens()).toEqual([
			{
				segment: 0,
				usedPercentage: 40,
				resetDetected: false,
				tokensUp: 150,
				tokensDown: 450,
			},
		]);
	});

	it("keeps accumulating on the base segment after a reset opens a new one", async () => {
		await record({
			seven_day: { used_percentage: 80, resets_at: 1000 },
		});
		await recordWindowTokens(orm, "seven_day", 1000, 100, 200);
		await record({
			seven_day: { used_percentage: 5, resets_at: 1000 },
		});

		await recordWindowTokens(orm, "seven_day", 1000, 30, 70);

		expect(await tokens()).toEqual([
			{
				segment: 0,
				usedPercentage: 80,
				resetDetected: true,
				tokensUp: 130,
				tokensDown: 270,
			},
			{
				segment: 1,
				usedPercentage: 5,
				resetDetected: false,
				tokensUp: 0,
				tokensDown: 0,
			},
		]);
	});

	it("preserves the base segment's tokens through a collapse", async () => {
		await record({
			seven_day: { used_percentage: 80, resets_at: 1000 },
		});
		await recordWindowTokens(orm, "seven_day", 1000, 100, 200);
		await record({
			seven_day: { used_percentage: 5, resets_at: 1000 },
		});

		await record({
			seven_day: { used_percentage: 90, resets_at: 1000 },
		});

		expect(await tokens()).toEqual([
			{
				segment: 0,
				usedPercentage: 90,
				resetDetected: false,
				tokensUp: 100,
				tokensDown: 200,
			},
		]);
	});

	it("is a no-op when the cycle has no recorded peak yet", async () => {
		await recordWindowTokens(orm, "five_hour", 1000, 100, 200);
		expect(await tokens()).toEqual([]);
	});

	it("ignores a non-positive delta", async () => {
		await record({
			five_hour: { used_percentage: 40, resets_at: 1000 },
		});

		await recordWindowTokens(orm, "five_hour", 1000, 0, 0);

		expect(await tokens()).toEqual([
			{
				segment: 0,
				usedPercentage: 40,
				resetDetected: false,
				tokensUp: 0,
				tokensDown: 0,
			},
		]);
	});
});
