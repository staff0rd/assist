import { describe, expect, it } from "vitest";
import type { ConfigEntry } from "../../../../../../../../../../../config/readConfigEntries";
import type { ConfigSource } from "../../../../../../../../../../../config/resolveConfigSources";
import { configClearTitle } from "./configClearTitle";

const entry = (sources: ConfigSource[]): ConfigEntry =>
	({
		key: "commit.push",
		value: true,
		source: sources[0] ?? "default",
		sources,
		repoKey: "assist",
	}) as ConfigEntry;

describe("configClearTitle", () => {
	it("names the layer a clear falls back to", () => {
		expect(configClearTitle(entry(["repo", "global"]), "repo")).toBe(
			"Remove commit.push from repos.assist in ~/.assist.yml — falls back to Global",
		);
	});

	it("names the next layer down rather than a higher override", () => {
		expect(
			configClearTitle(entry(["project", "repo", "global"]), "project"),
		).toBe(
			"Remove commit.push from this repo's assist.yml — falls back to This repo",
		);
	});

	it("says the schema default when clearing the only value", () => {
		expect(configClearTitle(entry(["repo"]), "repo")).toBe(
			"Remove commit.push from repos.assist in ~/.assist.yml — reverts to the schema default",
		);
	});
});
