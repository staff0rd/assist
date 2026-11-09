import { describe, expect, it } from "vitest";
import type { InboxScanResult } from "./runInboxScanPass";
import { emptyScanUsage } from "./emptyScanUsage";
import type { InboxScanEvent } from "./InboxScanEvent";
import { scanUnopenedThreads } from "./scanUnopenedThreads";

function result(opened: string[], flagged: string[] = []): InboxScanResult {
	return {
		messages: flagged.map((messageId) => ({
			source: "gmail",
			messageId,
			sender: "Sam",
			summary: "Retrieve the key",
			link: "https://mail.google.com/x",
		})),
		usage: emptyScanUsage(),
		threads: { found: [], opened },
	};
}

describe("scanUnopenedThreads", () => {
	it("does nothing when every thread was opened", async () => {
		const calls: string[][] = [];
		const messages = await scanUnopenedThreads([], async (ids) => {
			calls.push(ids);
			return result(ids);
		});
		expect(calls).toEqual([]);
		expect(messages).toEqual([]);
	});

	it("batches unopened threads and collects their flagged messages", async () => {
		const ids = Array.from({ length: 30 }, (_, i) => `t${i}`);
		const calls: string[][] = [];
		const messages = await scanUnopenedThreads(ids, async (batch) => {
			calls.push(batch);
			return result(batch, batch.includes("t27") ? ["m27"] : []);
		});
		expect(calls.map((c) => c.length)).toEqual([25, 5]);
		expect(messages.map((m) => m.messageId)).toEqual(["m27"]);
	});

	it("retries threads a pass skipped, then reports any still unopened", async () => {
		const calls: string[][] = [];
		const events: InboxScanEvent[] = [];
		await scanUnopenedThreads(
			["a", "b"],
			async (batch) => {
				calls.push(batch);
				return result(batch.filter((id) => id !== "b"));
			},
			(event) => events.push(event),
		);
		expect(calls).toEqual([["a", "b"], ["b"]]);
		expect(events.map((e) => [e.kind, e.detail])).toEqual([
			["error", "1 unread thread(s) never opened: b"],
		]);
	});

	it("keeps going when a pass fails", async () => {
		const events: InboxScanEvent[] = [];
		const messages = await scanUnopenedThreads(
			["a"],
			async () => {
				throw new Error("claude exited 1");
			},
			(event) => events.push(event),
		);
		expect(messages).toEqual([]);
		expect(events.map((e) => e.detail)).toEqual([
			"claude exited 1",
			"claude exited 1",
			"1 unread thread(s) never opened: a",
		]);
	});
});
