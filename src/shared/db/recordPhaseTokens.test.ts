import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { getPhaseActiveMs } from "./getPhaseActiveMs";
import { recordPhaseActiveMs } from "./recordPhaseActiveMs";
import { recordPhaseTokens } from "./recordPhaseTokens";
import { items, phaseUsage } from "./schema";

describe("phase usage accumulation", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		await orm.insert(items).values({ id: 1, origin: "test", name: "Item" });
	});

	afterEach(async () => {
		await close();
	});

	const rows = () =>
		orm
			.select()
			.from(phaseUsage)
			.orderBy(phaseUsage.itemId, phaseUsage.phaseIdx);

	describe("recordPhaseTokens", () => {
		it("only records a baseline on the first update, adding no tokens", async () => {
			await recordPhaseTokens(orm, 1, 0, 500, 200);

			expect(await rows()).toEqual([
				{
					itemId: 1,
					phaseIdx: 0,
					tokensUp: 0,
					tokensDown: 0,
					activeMs: 0,
					lastTotalIn: 500,
					lastTotalOut: 200,
				},
			]);
		});

		it("accumulates positive growth over the baseline and advances it", async () => {
			await recordPhaseTokens(orm, 1, 0, 500, 200);
			await recordPhaseTokens(orm, 1, 0, 800, 260);

			expect(await rows()).toMatchObject([
				{ tokensDown: 300, tokensUp: 60, lastTotalIn: 800, lastTotalOut: 260 },
			]);
		});

		it("never subtracts when the context total drops (compaction), just rebaselines", async () => {
			await recordPhaseTokens(orm, 1, 0, 500, 200);
			await recordPhaseTokens(orm, 1, 0, 800, 260);
			await recordPhaseTokens(orm, 1, 0, 100, 30); // compaction: totals shrink
			await recordPhaseTokens(orm, 1, 0, 150, 45);

			expect(await rows()).toMatchObject([
				{ tokensDown: 350, tokensUp: 75, lastTotalIn: 150, lastTotalOut: 45 },
			]);
		});
	});

	describe("recordPhaseActiveMs", () => {
		it("sums intervals, creating the row with a null token baseline", async () => {
			await recordPhaseActiveMs(orm, 1, 0, 1000);
			await recordPhaseActiveMs(orm, 1, 0, 500);

			expect(await rows()).toEqual([
				{
					itemId: 1,
					phaseIdx: 0,
					tokensUp: 0,
					tokensDown: 0,
					activeMs: 1500,
					lastTotalIn: null,
					lastTotalOut: null,
				},
			]);
		});

		it("ignores non-positive durations", async () => {
			await recordPhaseActiveMs(orm, 1, 0, 0);
			await recordPhaseActiveMs(orm, 1, 0, -100);

			expect(await rows()).toEqual([]);
		});

		it("does not over-count tokens after an active-only row exists", async () => {
			await recordPhaseActiveMs(orm, 1, 0, 1000);
			// first token update sees a null baseline, so it adds nothing
			await recordPhaseTokens(orm, 1, 0, 500, 200);
			await recordPhaseTokens(orm, 1, 0, 700, 250);

			expect(await rows()).toMatchObject([
				{ activeMs: 1000, tokensDown: 200, tokensUp: 50 },
			]);
		});
	});

	describe("getPhaseActiveMs", () => {
		it("returns 0 when the phase has no recorded usage", async () => {
			expect(await getPhaseActiveMs(orm, 1, 0)).toBe(0);
		});

		it("returns only the requested phase's active_ms", async () => {
			await recordPhaseActiveMs(orm, 1, 0, 1000);
			await recordPhaseActiveMs(orm, 1, 1, 2500);
			await recordPhaseActiveMs(orm, 1, 0, 500);

			expect(await getPhaseActiveMs(orm, 1, 0)).toBe(1500);
			expect(await getPhaseActiveMs(orm, 1, 1)).toBe(2500);
		});
	});
});
