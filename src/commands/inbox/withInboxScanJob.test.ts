import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { jobRuns } from "../../shared/db/jobRuns";
import { listJobRuns } from "../../shared/db/listJobRuns";
import type { InboxScanUsage } from "./InboxScanEvent";
import { withInboxScanJob } from "./withInboxScanJob";

const usage: InboxScanUsage = {
	input: 100,
	output: 20,
	cacheRead: 80,
	cacheWrite: 5,
	costUsd: 0.12,
	durationMs: 1000,
};

describe("withInboxScanJob", () => {
	let orm: Db;

	beforeAll(async () => {
		({ orm } = await createTestDb());
	});

	afterEach(async () => {
		await orm.delete(jobRuns);
	});

	const rows = async () =>
		(await listJobRuns(orm, { limit: 10, offset: 0 })).rows;

	it("shows a running row while the scan is in progress", async () => {
		let seen: unknown[] = [];
		await withInboxScanJob(orm, "scheduled", {}, async () => {
			seen = await rows();
			return { flagged: 0, added: 0, usage };
		});
		expect(seen).toEqual([
			expect.objectContaining({
				kind: "inbox-scan",
				trigger: "scheduled",
				status: "running",
				finishedAt: null,
			}),
		]);
	});

	it("updates the row in place with usage, model and counts when it finishes", async () => {
		await withInboxScanJob(orm, "manual", {}, async (listener) => {
			listener.onModel?.("claude-sonnet-x");
			return { flagged: 3, added: 1, usage };
		});
		const [row] = await rows();
		expect(row).toMatchObject({
			trigger: "manual",
			status: "finished",
			model: "claude-sonnet-x",
			inputTokens: 100,
			outputTokens: 20,
			cacheReadTokens: 80,
			cacheWriteTokens: 5,
			costUsd: 0.12,
			detail: "3 flagged · 1 new",
		});
		expect(row.finishedAt).toBeInstanceOf(Date);
		expect(row.durationMs).toBeGreaterThanOrEqual(0);
	});

	it("records the failure with the usage seen so far and rethrows", async () => {
		const forwarded: InboxScanUsage[] = [];
		await expect(
			withInboxScanJob(
				orm,
				"scheduled",
				{ onUsage: (u) => forwarded.push(u) },
				async (listener) => {
					listener.onUsage?.({ ...usage, costUsd: null });
					throw new Error("claude exited 1");
				},
			),
		).rejects.toThrow("claude exited 1");
		const [row] = await rows();
		expect(row).toMatchObject({
			status: "failed",
			detail: "claude exited 1",
			inputTokens: 100,
			costUsd: null,
		});
		expect(forwarded).toHaveLength(1);
	});
});
