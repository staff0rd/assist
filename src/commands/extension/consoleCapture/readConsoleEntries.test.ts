import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";
import { addConsoleEntries } from "./addConsoleEntries";
import { clearConsoleEntries } from "./clearConsoleEntries";
import { readConsoleEntries } from "./readConsoleEntries";
import type { ConsoleEntry } from "./types";

const NOW = Date.UTC(2026, 9, 31, 12);

const entries: ConsoleEntry[] = [
	{
		time: NOW,
		level: "warn",
		message: "slow",
		url: "https://github.com/a",
		tabId: 1,
	},
	{
		time: NOW + 1,
		level: "error",
		message: "Boom",
		url: "http://localhost:3000/",
		tabId: 2,
	},
	{
		time: NOW + 2,
		level: "uncaught",
		message: "x",
		stack: "at boom.js",
		url: "https://github.com/b",
		tabId: 1,
	},
];

beforeEach(async () => {
	globalThis.indexedDB = new IDBFactory();
	await addConsoleEntries(entries, NOW);
});

describe("readConsoleEntries", () => {
	it("returns the newest entries up to the limit, oldest first", async () => {
		expect(await readConsoleEntries({ limit: 2 })).toEqual(entries.slice(1));
	});

	it("filters by tab, time and case-insensitive text", async () => {
		expect(await readConsoleEntries({ tabId: 1, limit: 10 })).toEqual([
			entries[0],
			entries[2],
		]);
		expect(await readConsoleEntries({ since: NOW + 1, limit: 10 })).toEqual(
			entries.slice(1),
		);
		expect(await readConsoleEntries({ grep: "BOOM", limit: 10 })).toEqual(
			entries.slice(1),
		);
	});

	it("returns nothing after the store is cleared", async () => {
		await clearConsoleEntries();
		expect(await readConsoleEntries({ limit: 10 })).toEqual([]);
	});
});
