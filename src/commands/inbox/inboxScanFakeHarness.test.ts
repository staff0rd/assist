import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { inboxMessages } from "../../shared/db/inboxMessages";
import { jobRuns } from "../../shared/db/jobRuns";
import { listInboxMessages } from "../../shared/db/listInboxMessages";
import { listJobRuns } from "../../shared/db/listJobRuns";
import { readInboxLastScan } from "../../shared/db/readInboxLastScan";
import { metadata } from "../../shared/db/schema";
import { codexAdapter } from "../../shared/harnessAdapters/codexAdapter";
import type { ConnectorRun } from "../../shared/harnessAdapters/types";
import { unsupported } from "../../shared/harnessAdapters/unsupported";
import type { FakeConnectorScript } from "../../test/mocks/fakeConnectorRun";
import { fakeHarnessCalls } from "../../test/mocks/fakeHarnessCalls";
import { fakeHarnessMock } from "../../test/mocks/fakeHarnessMock";
import { INBOX_SCAN_TIMEOUT_MS } from "./inboxConnectorRun";
import type { InboxScanEvent } from "./InboxScanEvent";
import { runInboxScan } from "./runInboxScan";

const flagged = (messageId: string) => ({
	source: "gmail" as const,
	messageId,
	sender: "Sam",
	summary: "Retrieve the key",
	link: `https://mail.google.com/${messageId}`,
});

const isFollowUp = (run: ConnectorRun) =>
	run.tools.length === 1 && run.tools[0] === "gmail.getThread";

describe("inbox scan through a fake harness adapter", () => {
	let orm: Db;

	beforeAll(async () => {
		({ orm } = await createTestDb());
	});

	afterEach(async () => {
		await orm.delete(jobRuns);
		await orm.delete(inboxMessages);
		await orm.delete(metadata);
	});

	const scan = (script: FakeConnectorScript, events: InboxScanEvent[] = []) => {
		const calls = fakeHarnessCalls();
		const adapter = fakeHarnessMock(calls, script);
		return {
			calls,
			result: runInboxScan(orm, {
				trigger: "manual",
				adapter,
				onEvent: (e) => events.push(e),
			}),
		};
	};

	it("persists valid output, follows up unopened threads and reports progress", async () => {
		const events: InboxScanEvent[] = [];
		const { calls, result } = scan(
			(run) =>
				isFollowUp(run)
					? {
							steps: [
								{
									type: "call",
									tool: "gmail.getThread",
									input: { threadId: "t2" },
								},
							],
							output: { messages: [flagged("m2")] },
						}
					: {
							steps: [
								{ type: "model", model: "fake-model" },
								{
									type: "call",
									tool: "gmail.searchThreads",
									input: { query: "is:unread" },
								},
								{
									type: "toolResult",
									callId: "c0",
									text: JSON.stringify({
										threads: [{ id: "t1" }, { id: "t2" }],
									}),
								},
								{
									type: "call",
									tool: "gmail.getThread",
									input: { threadId: "t1" },
								},
								{ type: "text", text: "Done" },
							],
							output: { messages: [flagged("m1")] },
						},
			events,
		);
		await expect(result).resolves.toMatchObject({ flagged: 2, added: 2 });
		expect(calls.connector.map((r) => r.tools)).toEqual([
			[
				"gmail.searchThreads",
				"gmail.getThread",
				"slack.search",
				"slack.readThread",
			],
			["gmail.getThread"],
		]);
		expect(calls.connector[1].prompt).toContain("- t2");
		expect(calls.connector[0].timeoutMs).toBe(INBOX_SCAN_TIMEOUT_MS);
		expect(calls.connector[0].schema).toMatchObject({
			$schema: "http://json-schema.org/draft-07/schema#",
		});
		expect(events.map((e) => [e.kind, e.label, e.detail])).toEqual([
			["tool", "Fake gmail.searchThreads", "is:unread"],
			["tool", "Fake gmail.getThread", "t1"],
			["text", "Assistant", "Done"],
			["tool", "Fake gmail.getThread", "t2"],
		]);
		expect(
			(await listInboxMessages(orm)).map((m) => m.messageId).sort(),
		).toEqual(["m1", "m2"]);
		const [job] = (await listJobRuns(orm, { limit: 1, offset: 0 })).rows;
		expect(job).toMatchObject({ status: "finished", model: "fake-model" });
	});

	it("fails the job on malformed output without persisting anything", async () => {
		const { result } = scan(() => ({
			output: { messages: [{ source: "fax" }] },
		}));
		await expect(result).rejects.toThrow(
			"Inbox scan returned malformed output",
		);
		expect(await listInboxMessages(orm)).toEqual([]);
		expect(await readInboxLastScan(orm)).toBeUndefined();
		const [job] = (await listJobRuns(orm, { limit: 1, offset: 0 })).rows;
		expect(job).toMatchObject({ status: "failed" });
	});

	it("asks only for read tools, so a write tool call is refused by the adapter", async () => {
		const { result } = scan(() => ({
			steps: [{ type: "call", tool: "fake.sendMessage" }],
			output: { messages: [] },
		}));
		await expect(result).rejects.toThrow(
			"Inbox scan failed: fake harness refused fake.sendMessage: not allowed",
		);
	});

	it("reports a timed-out or cancelled run as a failed scan", async () => {
		const { result } = scan(() => ({ fail: "fake was killed (SIGTERM)" }));
		await expect(result).rejects.toThrow(
			"Inbox scan failed: fake was killed (SIGTERM)",
		);
		const [job] = (await listJobRuns(orm, { limit: 1, offset: 0 })).rows;
		expect(job).toMatchObject({ status: "failed" });
	});

	it("retries a follow-up pass that failed, keeping the main scan's messages", async () => {
		const events: InboxScanEvent[] = [];
		let followUps = 0;
		const { result } = scan(
			(run) =>
				isFollowUp(run)
					? followUps++ === 0
						? { fail: "fake was killed (SIGTERM)" }
						: { output: { messages: [] } }
					: {
							steps: [
								{ type: "call", tool: "gmail.searchThreads" },
								{
									type: "toolResult",
									callId: "c0",
									text: '{"threads":[{"id":"t9"}]}',
								},
							],
							output: { messages: [flagged("m1")] },
						},
			events,
		);
		await expect(result).resolves.toMatchObject({ flagged: 1 });
		expect(followUps).toBe(2);
		expect(
			events.filter((e) => e.kind === "error").map((e) => e.detail),
		).toEqual([
			"Inbox scan failed: fake was killed (SIGTERM)",
			"1 unread thread(s) never opened: t9",
		]);
	});

	it("fails before spawning when a connector probe reports it missing", async () => {
		const calls = fakeHarnessCalls();
		const base = fakeHarnessMock(calls);
		const adapter = {
			...base,
			capabilities: {
				...base.capabilities,
				"connector.slack.read": () =>
					unsupported("Slack is not connected", "connect Slack"),
			},
		};
		await expect(
			runInboxScan(orm, { trigger: "manual", adapter }),
		).rejects.toThrow(
			"Inbox scan is unavailable on Fake:\n  - Slack is not connected (connector.slack.read); connect Slack",
		);
		expect(calls.connector).toEqual([]);
		expect((await listJobRuns(orm, { limit: 1, offset: 0 })).rows).toEqual([]);
	});

	it("refuses Codex with its declared reasons and never runs it", async () => {
		await expect(
			runInboxScan(orm, {
				trigger: "manual",
				adapter: { ...codexAdapter, detect: () => ({ supported: true }) },
			}),
		).rejects.toThrow(
			/Inbox scan is unavailable on Codex:[\s\S]*connector\.gmail\.read/,
		);
	});
});
