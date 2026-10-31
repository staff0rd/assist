import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";
import { addConsoleEntries } from "./addConsoleEntries";
import { pruneConsoleEntries } from "./pruneConsoleEntries";
import { readConsoleEntries } from "./readConsoleEntries";
import { CONSOLE_MAX_AGE_MS, type ConsoleEntry } from "./types";

const NOW = Date.UTC(2026, 9, 31, 12);

function entry(time: number, message = `m${time}`): ConsoleEntry {
	return {
		time,
		level: "error",
		message,
		url: "https://github.com/",
		tabId: 1,
	};
}

const readAll = () => readConsoleEntries({ limit: Number.MAX_SAFE_INTEGER });

beforeEach(() => {
	globalThis.indexedDB = new IDBFactory();
});

describe("pruneConsoleStore", () => {
	it("drops entries older than 7 days on each write", async () => {
		await addConsoleEntries(
			[entry(NOW - CONSOLE_MAX_AGE_MS - 1), entry(NOW - CONSOLE_MAX_AGE_MS)],
			NOW - 10,
		);
		await addConsoleEntries([entry(NOW)], NOW);
		expect((await readAll()).map((e) => e.time)).toEqual([
			NOW - CONSOLE_MAX_AGE_MS,
			NOW,
		]);
	});

	it("drops expired entries on the alarm without a write", async () => {
		await addConsoleEntries([entry(NOW - 1000), entry(NOW)], NOW);
		await pruneConsoleEntries(NOW + CONSOLE_MAX_AGE_MS);
		expect((await readAll()).map((e) => e.time)).toEqual([NOW]);
	});

	it("keeps only the newest entries over the cap", async () => {
		const limits = { maxAgeMs: CONSOLE_MAX_AGE_MS, maxEntries: 3 };
		await addConsoleEntries(
			[1, 2].map((i) => entry(NOW + i)),
			NOW,
			limits,
		);
		await addConsoleEntries(
			[3, 4, 5].map((i) => entry(NOW + i)),
			NOW,
			limits,
		);
		expect((await readAll()).map((e) => e.time)).toEqual([
			NOW + 3,
			NOW + 4,
			NOW + 5,
		]);
	});

	it("trims a single entry over the cap", async () => {
		const limits = { maxAgeMs: CONSOLE_MAX_AGE_MS, maxEntries: 2 };
		await addConsoleEntries(
			[1, 2, 3].map((i) => entry(NOW + i)),
			NOW,
			limits,
		);
		expect((await readAll()).map((e) => e.time)).toEqual([NOW + 2, NOW + 3]);
	});
});
