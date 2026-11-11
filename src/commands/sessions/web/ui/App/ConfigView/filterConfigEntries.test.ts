import { describe, expect, it } from "vitest";
import type { ConfigEntry } from "../../../../../config/readConfigEntries";
import type { ConfigSource } from "../../../../../config/resolveConfigSources";
import { filterConfigEntries } from "./filterConfigEntries";

function entry(
	key: string,
	note?: string,
	source: ConfigSource = "default",
): ConfigEntry {
	return { key, type: "string", value: undefined, source, note };
}

const entries = [
	entry("commit.pull", "Rebase onto the remote first", "project"),
	entry("backup.dir", undefined, "repo"),
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

	it("keeps only entries whose effective source is selected", () => {
		expect(
			filterConfigEntries(entries, "", new Set(["project", "default"])).map(
				(e) => e.key,
			),
		).toEqual(["commit.pull", "sessions.daemonPort"]);
	});

	it("returns every entry when no scope is selected", () => {
		expect(filterConfigEntries(entries, "", new Set())).toEqual(entries);
	});

	it("requires both the search and the scope to match", () => {
		expect(
			filterConfigEntries(entries, "port", new Set(["default"])).map(
				(e) => e.key,
			),
		).toEqual(["sessions.daemonPort"]);
		expect(filterConfigEntries(entries, "commit", new Set(["repo"]))).toEqual(
			[],
		);
	});
});
