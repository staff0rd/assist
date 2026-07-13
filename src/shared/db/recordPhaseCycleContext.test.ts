import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { recordPhaseCycleContext } from "./recordPhaseCycleContext";
import { items, phaseCycleContext } from "./schema";

describe("recordPhaseCycleContext", () => {
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
			.select({
				phaseIdx: phaseCycleContext.phaseIdx,
				window: phaseCycleContext.window,
				resetsAt: phaseCycleContext.resetsAt,
				peakContextPct: phaseCycleContext.peakContextPct,
			})
			.from(phaseCycleContext)
			.orderBy(
				phaseCycleContext.window,
				phaseCycleContext.resetsAt,
				phaseCycleContext.phaseIdx,
			);

	it("keeps the highest reading per phase within a cycle", async () => {
		await recordPhaseCycleContext(orm, 1, 0, "five_hour", 1000, 30);
		await recordPhaseCycleContext(orm, 1, 0, "five_hour", 1000, 55);
		await recordPhaseCycleContext(orm, 1, 0, "five_hour", 1000, 40);

		expect(await rows()).toEqual([
			{ phaseIdx: 0, window: "five_hour", resetsAt: 1000, peakContextPct: 55 },
		]);
	});

	it("holds a separate per-cycle peak when a phase spans a reset", async () => {
		await recordPhaseCycleContext(orm, 1, 0, "five_hour", 1000, 45);
		await recordPhaseCycleContext(orm, 1, 0, "five_hour", 2000, 70);

		expect(await rows()).toEqual([
			{ phaseIdx: 0, window: "five_hour", resetsAt: 1000, peakContextPct: 45 },
			{ phaseIdx: 0, window: "five_hour", resetsAt: 2000, peakContextPct: 70 },
		]);
	});

	it("skips a zero reading, creating no row", async () => {
		await recordPhaseCycleContext(orm, 1, 0, "five_hour", 1000, 0);
		expect(await rows()).toEqual([]);
	});
});
