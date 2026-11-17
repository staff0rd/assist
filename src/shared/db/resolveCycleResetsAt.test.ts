import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { recordPhaseCycleContext } from "./recordPhaseCycleContext";
import { recordWindowPeak } from "./recordWindowPeak";
import { recordWindowTokens } from "./recordWindowTokens";
import { items, phaseCycleContext, usagePeaks } from "./schema";

describe("jittered resets_at", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		await orm.insert(items).values({ id: 1, origin: "test", name: "Item" });
	});

	afterEach(async () => {
		await close();
	});

	const NOW = 100;
	const CYCLE = 1795178696;
	const SEVEN_DAYS = 7 * 24 * 60 * 60;

	const peaks = () =>
		orm
			.select({
				resetsAt: usagePeaks.resetsAt,
				usedPercentage: usagePeaks.usedPercentage,
				tokensUp: usagePeaks.tokensUp,
				tokensDown: usagePeaks.tokensDown,
			})
			.from(usagePeaks)
			.orderBy(usagePeaks.resetsAt);

	const contexts = () =>
		orm
			.select({
				phaseIdx: phaseCycleContext.phaseIdx,
				resetsAt: phaseCycleContext.resetsAt,
				peakContextPct: phaseCycleContext.peakContextPct,
			})
			.from(phaseCycleContext)
			.orderBy(phaseCycleContext.resetsAt, phaseCycleContext.phaseIdx);

	it("lands a reading 1s off an existing cycle on that cycle", async () => {
		await recordWindowPeak(orm, "codex:seven_day", CYCLE, 8, NOW);
		await recordWindowPeak(orm, "codex:seven_day", CYCLE + 1, 10, NOW);
		await recordWindowTokens(orm, "codex:seven_day", CYCLE, 100, 200);
		await recordWindowTokens(orm, "codex:seven_day", CYCLE + 1, 10, 20);
		await recordPhaseCycleContext(orm, 1, 0, "codex:seven_day", CYCLE, 16);
		await recordPhaseCycleContext(orm, 1, 0, "codex:seven_day", CYCLE - 1, 19);
		await recordPhaseCycleContext(orm, 1, 1, "codex:seven_day", CYCLE + 1, 12);

		expect(await peaks()).toEqual([
			{ resetsAt: CYCLE, usedPercentage: 10, tokensUp: 110, tokensDown: 220 },
		]);
		expect(await contexts()).toEqual([
			{ phaseIdx: 0, resetsAt: CYCLE, peakContextPct: 19 },
			{ phaseIdx: 1, resetsAt: CYCLE, peakContextPct: 12 },
		]);
	});

	it("opens a new cycle one window length later", async () => {
		await recordWindowPeak(orm, "codex:seven_day", CYCLE, 40, NOW);
		await recordWindowPeak(orm, "codex:seven_day", CYCLE + SEVEN_DAYS, 2, NOW);

		expect(await peaks()).toEqual([
			{ resetsAt: CYCLE, usedPercentage: 40, tokensUp: 0, tokensDown: 0 },
			{
				resetsAt: CYCLE + SEVEN_DAYS,
				usedPercentage: 2,
				tokensUp: 0,
				tokensDown: 0,
			},
		]);
	});

	it("keeps the same jitter in another window separate", async () => {
		await recordWindowPeak(orm, "codex:seven_day", CYCLE, 40, NOW);
		await recordWindowPeak(orm, "seven_day", CYCLE + 1, 5, NOW);

		expect((await peaks()).map((p) => p.resetsAt)).toEqual([CYCLE, CYCLE + 1]);
	});
});
