import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { recordPhaseSession } from "./recordPhaseSession";
import { items, phaseSessions } from "./schema";

describe("recordPhaseSession", () => {
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
			.from(phaseSessions)
			.orderBy(phaseSessions.phaseIdx, phaseSessions.claudeSessionId);

	it("records a session with machine and user", async () => {
		await recordPhaseSession(orm, 1, 0, "sess-1", "host-a", "alice");

		const all = await rows();
		expect(all).toHaveLength(1);
		expect(all[0]).toMatchObject({
			itemId: 1,
			phaseIdx: 0,
			claudeSessionId: "sess-1",
			hostname: "host-a",
			osUser: "alice",
		});
	});

	it("appends a distinct row when a retry mints a new session id", async () => {
		await recordPhaseSession(orm, 1, 0, "sess-1", "host-a", "alice");
		await recordPhaseSession(orm, 1, 0, "sess-2", "host-a", "alice");

		expect((await rows()).map((r) => r.claudeSessionId)).toEqual([
			"sess-1",
			"sess-2",
		]);
	});

	it("does not duplicate a resumed session id and keeps real machine/user", async () => {
		await recordPhaseSession(orm, 1, 0, "sess-1", "host-a", "alice");
		await recordPhaseSession(orm, 1, 0, "sess-1", "host-b", "bob");

		const all = await rows();
		expect(all).toHaveLength(1);
		expect(all[0]).toMatchObject({ hostname: "host-a", osUser: "alice" });
	});

	it("upgrades a backfilled unknown row to the captured machine/user", async () => {
		await recordPhaseSession(orm, 1, 0, "sess-1", "unknown", "unknown");
		await recordPhaseSession(orm, 1, 0, "sess-1", "host-a", "alice");

		const all = await rows();
		expect(all).toHaveLength(1);
		expect(all[0]).toMatchObject({ hostname: "host-a", osUser: "alice" });
	});

	it("keeps the same session id on different phases distinct", async () => {
		await recordPhaseSession(orm, 1, 0, "sess-1", "host-a", "alice");
		await recordPhaseSession(orm, 1, 1, "sess-1", "host-a", "alice");

		expect(await rows()).toHaveLength(2);
	});
});
