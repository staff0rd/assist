import { describe, expect, it } from "vitest";
import type { ConfigEntry } from "../../../../../../../config/readConfigEntries";
import { filterConfigEntries } from "./filterConfigEntries";

function entry(key: string, note?: string): ConfigEntry {
	return { key, type: "string", value: undefined, source: "default", note };
}

const entries = [
	entry("commit.pull", "Rebase onto the remote first"),
	entry("backup.dir"),
	entry("sessions.daemonPort", "Port the listener binds to"),
];

describe("filterConfigEntries", () => {
	it("matches case-insensitively", () => {
		expect(filterConfigEntries(entries, "COMMIT").map((e) => e.key)).toEqual([
			"commit.pull",
		]);
	});

	it("matches a substring in the middle of the dotted key", () => {
		expect(filterConfigEntries(entries, "daemon").map((e) => e.key)).toEqual([
			"sessions.daemonPort",
		]);
	});

	it("returns every entry for an empty or whitespace search", () => {
		expect(filterConfigEntries(entries, "")).toEqual(entries);
		expect(filterConfigEntries(entries, "   ")).toEqual(entries);
	});

	it("returns nothing when no key matches", () => {
		expect(filterConfigEntries(entries, "nosuchkey")).toEqual([]);
	});

	it("matches a word that appears only in the note", () => {
		expect(filterConfigEntries(entries, "rebase").map((e) => e.key)).toEqual([
			"commit.pull",
		]);
	});

	it("matches a note case-insensitively", () => {
		expect(filterConfigEntries(entries, "BINDS").map((e) => e.key)).toEqual([
			"sessions.daemonPort",
		]);
	});

	it("matches a word that appears only in the key", () => {
		expect(
			filterConfigEntries(entries, "daemonport").map((e) => e.key),
		).toEqual(["sessions.daemonPort"]);
	});

	it("still matches an entry with no note on its key", () => {
		expect(filterConfigEntries(entries, "backup").map((e) => e.key)).toEqual([
			"backup.dir",
		]);
	});
});
