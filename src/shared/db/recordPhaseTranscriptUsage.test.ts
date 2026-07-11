import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { recordPhaseActiveMs } from "./recordPhaseActiveMs";
import { recordPhaseTranscriptUsage } from "./recordPhaseTranscriptUsage";
import { items, phaseUsage } from "./schema";

describe("recordPhaseTranscriptUsage", () => {
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

	const response = (
		messageId: string,
		inputTokens: number,
		outputTokens: number,
	) => ({
		messageId,
		inputTokens,
		outputTokens,
	});

	it("accumulates output→up and input→down for new responses", async () => {
		const delta = await recordPhaseTranscriptUsage(orm, 1, 0, [
			response("msg_a", 100, 20),
			response("msg_b", 50, 10),
		]);

		expect(delta).toEqual({ tokensUp: 30, tokensDown: 150 });
		expect(await rows()).toMatchObject([
			{ itemId: 1, phaseIdx: 0, tokensUp: 30, tokensDown: 150 },
		]);
	});

	it("counts each message.id exactly once across repeated reads", async () => {
		await recordPhaseTranscriptUsage(orm, 1, 0, [response("msg_a", 100, 20)]);

		const delta = await recordPhaseTranscriptUsage(orm, 1, 0, [
			response("msg_a", 100, 20),
			response("msg_b", 40, 8),
		]);

		expect(delta).toEqual({ tokensUp: 8, tokensDown: 40 });
		expect(await rows()).toMatchObject([{ tokensUp: 28, tokensDown: 140 }]);
	});

	it("is a no-op when every response was already counted", async () => {
		const seen = [response("msg_a", 100, 20)];
		await recordPhaseTranscriptUsage(orm, 1, 0, seen);

		const delta = await recordPhaseTranscriptUsage(orm, 1, 0, seen);

		expect(delta).toEqual({ tokensUp: 0, tokensDown: 0 });
		expect(await rows()).toMatchObject([{ tokensUp: 20, tokensDown: 100 }]);
	});

	it("dedups duplicate ids within a single call", async () => {
		const delta = await recordPhaseTranscriptUsage(orm, 1, 0, [
			response("msg_a", 100, 20),
			response("msg_a", 100, 20),
		]);

		expect(delta).toEqual({ tokensUp: 20, tokensDown: 100 });
		expect(await rows()).toMatchObject([{ tokensUp: 20, tokensDown: 100 }]);
	});

	it("keeps phases independent", async () => {
		await recordPhaseTranscriptUsage(orm, 1, 0, [response("msg_a", 100, 20)]);
		await recordPhaseTranscriptUsage(orm, 1, 1, [response("msg_a", 30, 5)]);

		expect(await rows()).toMatchObject([
			{ phaseIdx: 0, tokensUp: 20, tokensDown: 100 },
			{ phaseIdx: 1, tokensUp: 5, tokensDown: 30 },
		]);
	});

	it("adds tokens onto an active-only row without disturbing active_ms", async () => {
		await recordPhaseActiveMs(orm, 1, 0, 1000);

		await recordPhaseTranscriptUsage(orm, 1, 0, [response("msg_a", 100, 20)]);

		expect(await rows()).toMatchObject([
			{ activeMs: 1000, tokensUp: 20, tokensDown: 100 },
		]);
	});

	it("returns a zero delta for an empty response list", async () => {
		expect(await recordPhaseTranscriptUsage(orm, 1, 0, [])).toEqual({
			tokensUp: 0,
			tokensDown: 0,
		});
		expect(await rows()).toEqual([]);
	});
});
