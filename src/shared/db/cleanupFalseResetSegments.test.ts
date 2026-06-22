import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	cleanupFalseResetSegments,
	collapseSegments,
} from "./cleanupFalseResetSegments";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { metadata, usagePeaks } from "./schema";

describe("collapseSegments", () => {
	describe("when segment peaks trend strictly downward", () => {
		it("keeps every genuine reset segment", () => {
			expect(collapseSegments([80, 20, 5])).toEqual([
				{ segment: 0, usedPercentage: 80, resetDetected: true },
				{ segment: 1, usedPercentage: 20, resetDetected: true },
				{ segment: 2, usedPercentage: 5, resetDetected: false },
			]);
		});
	});

	describe("when segment peaks trend upward (false resets)", () => {
		it("collapses them into the single true peak", () => {
			expect(collapseSegments([80, 90])).toEqual([
				{ segment: 0, usedPercentage: 90, resetDetected: false },
			]);
		});

		it("collapses a long upward-trending run", () => {
			expect(collapseSegments([50, 60, 70, 95])).toEqual([
				{ segment: 0, usedPercentage: 95, resetDetected: false },
			]);
		});
	});

	describe("when a genuine reset is buried among false ones", () => {
		it("keeps the reset and collapses noise that climbs back above it", () => {
			expect(collapseSegments([80, 20, 12, 25])).toEqual([
				{ segment: 0, usedPercentage: 80, resetDetected: true },
				{ segment: 1, usedPercentage: 25, resetDetected: false },
			]);
		});
	});

	describe("when a later peak is within the jitter threshold of a shallower one", () => {
		it("merges it rather than treating it as a reset", () => {
			expect(collapseSegments([80, 79.5])).toEqual([
				{ segment: 0, usedPercentage: 80, resetDetected: false },
			]);
		});
	});
});

describe("cleanupFalseResetSegments", () => {
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

	const seed = (
		rows: {
			window: "five_hour" | "seven_day";
			resetsAt: number;
			segment: number;
			usedPercentage: number;
			resetDetected: boolean;
		}[],
	) => orm.insert(usagePeaks).values(rows);

	describe("when a cycle holds upward-trending false reset segments", () => {
		it("collapses them into the single true peak", async () => {
			await seed([
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 80,
					resetDetected: true,
				},
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 1,
					usedPercentage: 85,
					resetDetected: true,
				},
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 2,
					usedPercentage: 90,
					resetDetected: false,
				},
			]);

			await cleanupFalseResetSegments(orm);

			expect(await peaks()).toEqual([
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 90,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
			]);
		});
	});

	describe("when a cycle holds a genuine reset", () => {
		it("leaves it untouched", async () => {
			await seed([
				{
					window: "seven_day",
					resetsAt: 2000,
					segment: 0,
					usedPercentage: 70,
					resetDetected: true,
				},
				{
					window: "seven_day",
					resetsAt: 2000,
					segment: 1,
					usedPercentage: 10,
					resetDetected: false,
				},
			]);

			await cleanupFalseResetSegments(orm);

			expect(await peaks()).toEqual([
				{
					window: "seven_day",
					resetsAt: 2000,
					segment: 0,
					usedPercentage: 70,
					resetDetected: true,
					createdAt: expect.any(Date),
				},
				{
					window: "seven_day",
					resetsAt: 2000,
					segment: 1,
					usedPercentage: 10,
					resetDetected: false,
					createdAt: expect.any(Date),
				},
			]);
		});
	});

	describe("when run twice", () => {
		it("is idempotent and does not re-scan after the first pass", async () => {
			await seed([
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 80,
					resetDetected: true,
				},
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 1,
					usedPercentage: 90,
					resetDetected: false,
				},
			]);

			await cleanupFalseResetSegments(orm);
			const afterFirst = await peaks();
			await cleanupFalseResetSegments(orm);

			expect(await peaks()).toEqual(afterFirst);
			expect(
				await orm
					.select()
					.from(metadata)
					.where(eq(metadata.key, "usage_peaks_false_reset_cleanup")),
			).toHaveLength(1);
		});
	});
});
