import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { failTimedOutInboxScans } from "../../commands/inbox/failTimedOutInboxScans";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { failStaleJobRuns } from "./failStaleJobRuns";
import { jobRunTotals } from "./jobRunTotals";
import { jobRuns } from "./jobRuns";
import { listJobRuns } from "./listJobRuns";

const DAY = 24 * 60 * 60_000;
const now = new Date("2026-11-01T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);

type Insert = typeof jobRuns.$inferInsert;

const run = (overrides: Partial<Insert>): Insert => ({
	kind: "inbox-scan",
	trigger: "scheduled",
	startedAt: ago(60_000),
	status: "finished",
	inputTokens: 100,
	outputTokens: 10,
	cacheReadTokens: 50,
	...overrides,
});

describe("job run queries", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeAll(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await orm.delete(jobRuns);
	});

	afterAll(async () => {
		await close();
	});

	it("totals runs, tokens, cost and failures over the window only", async () => {
		await orm
			.insert(jobRuns)
			.values([
				run({ costUsd: 0.5 }),
				run({ kind: "review", trigger: "manual", startedAt: ago(DAY) }),
				run({ status: "failed", startedAt: ago(2 * DAY), costUsd: 0.25 }),
				run({ status: "failed", startedAt: ago(40 * DAY), costUsd: 9 }),
			]);

		expect(await jobRunTotals(orm, ago(30 * DAY))).toEqual({
			runs: 3,
			runsByKind: { "inbox-scan": 2, review: 1 },
			inputTokens: 300,
			outputTokens: 30,
			cacheReadTokens: 150,
			costUsd: 0.75,
			failed: 1,
			lastFailure: { kind: "inbox-scan", startedAt: ago(2 * DAY) },
		});
	});

	it("reports no cost or failure when none is recorded", async () => {
		await orm.insert(jobRuns).values(run({ kind: "review" }));
		const totals = await jobRunTotals(orm, ago(30 * DAY));
		expect(totals.costUsd).toBeNull();
		expect(totals.lastFailure).toBeNull();
	});

	it("filters the listing by kind and trigger", async () => {
		await orm
			.insert(jobRuns)
			.values([
				run({}),
				run({ trigger: "manual" }),
				run({ kind: "review", trigger: "manual" }),
			]);
		const list = (filters: Parameters<typeof listJobRuns>[2]) =>
			listJobRuns(orm, { limit: 10, offset: 0 }, filters);

		expect((await list({ kind: "review" })).total).toBe(1);
		expect((await list({ trigger: "manual" })).total).toBe(2);
		const both = await list({ kind: "inbox-scan", trigger: "manual" });
		expect(both.rows).toEqual([
			expect.objectContaining({ kind: "inbox-scan", trigger: "manual" }),
		]);
		expect((await list({})).total).toBe(3);
	});

	it("fails only running rows started before the cutoff", async () => {
		await orm
			.insert(jobRuns)
			.values([
				run({ status: "running", startedAt: ago(DAY) }),
				run({ status: "running", startedAt: ago(1000) }),
				run({ startedAt: ago(DAY), detail: "kept" }),
			]);

		const failed = await failStaleJobRuns(orm, {
			startedBefore: ago(60_000),
			detail: "stale",
		});

		expect(failed).toBe(1);
		const { rows } = await listJobRuns(orm, { limit: 10, offset: 0 });
		expect(rows.map((row) => [row.status, row.detail])).toEqual([
			["running", null],
			["finished", "kept"],
			["failed", "stale"],
		]);
	});

	it("fails inbox scans running past their timeout", async () => {
		await orm
			.insert(jobRuns)
			.values([
				run({ status: "running", startedAt: ago(30 * 60_000) }),
				run({ status: "running", startedAt: ago(10 * 60_000) }),
			]);

		expect(await failTimedOutInboxScans(orm, now)).toBe(1);
	});
});
