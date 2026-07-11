import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { recordPhaseActiveMs } from "./recordPhaseActiveMs";
import { recordPhasePeakContext } from "./recordPhasePeakContext";
import { items, phaseUsage } from "./schema";

describe("recordPhasePeakContext", () => {
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

	it("records the peak on a fresh phase row", async () => {
		await recordPhasePeakContext(orm, 1, 0, 42);

		expect(await rows()).toMatchObject([
			{ itemId: 1, phaseIdx: 0, peakContextPct: 42 },
		]);
	});

	it("keeps the higher peak and never lowers it on a dip", async () => {
		await recordPhasePeakContext(orm, 1, 0, 70);
		await recordPhasePeakContext(orm, 1, 0, 55);

		expect(await rows()).toMatchObject([{ peakContextPct: 70 }]);

		await recordPhasePeakContext(orm, 1, 0, 88);

		expect(await rows()).toMatchObject([{ peakContextPct: 88 }]);
	});

	it("records the peak without disturbing existing token/active data", async () => {
		await recordPhaseActiveMs(orm, 1, 0, 1000);

		await recordPhasePeakContext(orm, 1, 0, 33);

		expect(await rows()).toMatchObject([
			{ activeMs: 1000, tokensUp: 0, tokensDown: 0, peakContextPct: 33 },
		]);
	});

	it("keeps phases independent", async () => {
		await recordPhasePeakContext(orm, 1, 0, 40);
		await recordPhasePeakContext(orm, 1, 1, 90);

		expect(await rows()).toMatchObject([
			{ phaseIdx: 0, peakContextPct: 40 },
			{ phaseIdx: 1, peakContextPct: 90 },
		]);
	});
});
