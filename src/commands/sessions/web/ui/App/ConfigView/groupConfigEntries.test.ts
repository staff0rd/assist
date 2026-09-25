import { describe, expect, it } from "vitest";
import type { ConfigEntry } from "../../../../../config/readConfigEntries";
import { groupConfigEntries } from "./groupConfigEntries";

function entry(key: string): ConfigEntry {
	return { key, type: "string", value: undefined, source: "default" };
}

describe("groupConfigEntries", () => {
	it("groups by the first path segment, sorted by group name", () => {
		const groups = groupConfigEntries([
			entry("commit.pull"),
			entry("backup.dir"),
			entry("commit.push"),
		]);

		expect(groups.map((group) => group.name)).toEqual(["backup", "commit"]);
		expect(groups[1].entries.map((item) => item.key)).toEqual([
			"commit.pull",
			"commit.push",
		]);
	});

	it("collects keys with no nesting under general", () => {
		const groups = groupConfigEntries([entry("run"), entry("deny")]);

		expect(groups).toEqual([
			{ name: "general", entries: [entry("run"), entry("deny")] },
		]);
	});
});
