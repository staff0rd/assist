// @vitest-environment jsdom
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addConsoleEntries } from "./addConsoleEntries";
import { attachRecordConsoleToggle } from "./attachRecordConsoleToggle";
import { readConsoleEntries } from "./readConsoleEntries";

let stored: Record<string, unknown>;

function render(): HTMLInputElement {
	document.body.innerHTML = `<input type="checkbox" data-record-console /><span data-console-status></span>`;
	return document.querySelector("input") as HTMLInputElement;
}

beforeEach(() => {
	globalThis.indexedDB = new IDBFactory();
	stored = {};
	vi.stubGlobal("browser", {
		storage: {
			local: {
				get: async (key: string) => ({ [key]: stored[key] }),
				set: async (items: Record<string, unknown>) => {
					Object.assign(stored, items);
				},
			},
		},
	});
});

afterEach(() => vi.unstubAllGlobals());

describe("attachRecordConsoleToggle", () => {
	it("is off by default", async () => {
		const checkbox = render();
		await attachRecordConsoleToggle();
		expect(checkbox.checked).toBe(false);
	});

	it("deletes every stored entry when turned off", async () => {
		stored.recordConsole = true;
		await addConsoleEntries(
			[{ time: Date.now(), level: "error", message: "x", url: "u", tabId: 1 }],
			Date.now(),
		);
		const checkbox = render();
		await attachRecordConsoleToggle();
		expect(checkbox.checked).toBe(true);
		checkbox.click();
		await vi.waitFor(() =>
			expect(document.querySelector("[data-console-status]")?.textContent).toBe(
				"Stopped; recorded entries deleted",
			),
		);
		expect(stored.recordConsole).toBe(false);
		expect(await readConsoleEntries({ limit: 10 })).toEqual([]);
	});
});
