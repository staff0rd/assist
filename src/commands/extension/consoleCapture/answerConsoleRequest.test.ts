import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addConsoleEntries } from "./addConsoleEntries";
import { answerConsoleRequest } from "./answerConsoleRequest";
import type { ConsoleEntry } from "./types";

const NOW = Date.UTC(2026, 9, 31, 12);
const tab = { id: 1, url: "https://github.com/a" };

const entry = (
	minutesAgo: number,
	tabId: number,
	message: string,
): ConsoleEntry => ({
	time: NOW - minutesAgo * 60_000,
	level: "error",
	message,
	url: `https://github.com/${tabId}`,
	tabId,
});

const entries = [
	entry(30, 1, "old boom"),
	entry(20, 2, "other tab boom"),
	entry(10, 1, "recent boom"),
	entry(5, 1, "recent quiet"),
	entry(1, 1, "latest boom"),
];

function stubRecording(recording: boolean) {
	vi.stubGlobal("browser", {
		storage: { local: { get: async () => ({ recordConsole: recording }) } },
	});
}

async function messages(request: Parameters<typeof answerConsoleRequest>[0]) {
	const reply = await answerConsoleRequest(
		request,
		request.all ? undefined : tab,
	);
	if (!reply.ok) throw new Error(reply.error);
	return (reply.result as { entries: ConsoleEntry[] }).entries.map(
		(found) => found.message,
	);
}

beforeEach(async () => {
	globalThis.indexedDB = new IDBFactory();
	vi.useFakeTimers({ toFake: ["Date"] });
	vi.setSystemTime(NOW);
	stubRecording(true);
	await addConsoleEntries(entries, NOW);
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe("answerConsoleRequest", () => {
	it("reports recording off and returns nothing", async () => {
		stubRecording(false);
		await expect(answerConsoleRequest({ op: "console" }, tab)).resolves.toEqual(
			{ ok: true, result: { tabUrl: tab.url, recording: false, entries: [] } },
		);
	});

	it("scopes to the target tab unless --all", async () => {
		expect(await messages({ op: "console" })).toEqual([
			"old boom",
			"recent boom",
			"recent quiet",
			"latest boom",
		]);
		expect(await messages({ op: "console", all: true })).toHaveLength(5);
	});

	it("keeps only entries newer than --since", async () => {
		expect(
			await messages({ op: "console", all: true, sinceMs: 15 * 60_000 }),
		).toEqual(["recent boom", "recent quiet", "latest boom"]);
	});

	it("applies --limit to the newest entries after filtering", async () => {
		expect(
			await messages({ op: "console", all: true, grep: "boom", limit: 2 }),
		).toEqual(["recent boom", "latest boom"]);
	});

	it("combines every filter and returns nothing when none match", async () => {
		expect(
			await messages({ op: "console", sinceMs: 15 * 60_000, grep: "BOOM" }),
		).toEqual(["recent boom", "latest boom"]);
		expect(await messages({ op: "console", grep: "nowhere" })).toEqual([]);
	});
});
