import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { findItemBySessionId } from "./findItemBySessionId";
import { items, phaseSessions, phaseUsage } from "./schema";

describe("findItemBySessionId", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeAll(async () => {
		({ orm, close } = await createTestDb());
		await orm.insert(items).values([
			{ id: 1, origin: "test", name: "One" },
			{ id: 2, origin: "test", name: "Two" },
		]);
	});

	afterEach(async () => {
		await orm.delete(phaseUsage);
		await orm.delete(phaseSessions);
	});

	afterAll(async () => {
		await close();
	});

	it("finds the item a claude session recorded usage against", async () => {
		await orm.insert(phaseUsage).values([
			{ itemId: 1, phaseIdx: 0, claudeSessionId: "sess-a" },
			{ itemId: 2, phaseIdx: 0, claudeSessionId: "sess-b" },
		]);

		expect(await findItemBySessionId(orm, "sess-b")).toBe(2);
	});

	it("returns undefined for an unknown session", async () => {
		await orm
			.insert(phaseUsage)
			.values([{ itemId: 1, phaseIdx: 0, claudeSessionId: "sess-a" }]);

		expect(await findItemBySessionId(orm, "sess-z")).toBeUndefined();
	});

	it("ignores phase rows with no session id", async () => {
		await orm.insert(phaseUsage).values([{ itemId: 1, phaseIdx: 0 }]);

		expect(await findItemBySessionId(orm, "sess-a")).toBeUndefined();
	});

	it("returns a single item when a session spans several phases", async () => {
		await orm.insert(phaseUsage).values([
			{ itemId: 1, phaseIdx: 2, claudeSessionId: "sess-a" },
			{ itemId: 1, phaseIdx: 1, claudeSessionId: "sess-a" },
		]);

		expect(await findItemBySessionId(orm, "sess-a")).toBe(1);
	});

	it("finds a late-bound conversation recorded only as a phase session", async () => {
		await orm
			.insert(phaseUsage)
			.values([
				{ itemId: 1, phaseIdx: 0, claudeSessionId: "launch-placeholder" },
			]);
		await orm.insert(phaseSessions).values([
			{
				itemId: 2,
				phaseIdx: 0,
				claudeSessionId: "codex-thread",
				hostname: "h",
				osUser: "u",
			},
		]);

		expect(await findItemBySessionId(orm, "codex-thread")).toBe(2);
		expect(await findItemBySessionId(orm, "launch-placeholder")).toBe(1);
	});
});
