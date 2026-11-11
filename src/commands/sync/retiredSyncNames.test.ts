import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { retiredSyncNames } from "./retiredSyncNames";

const claudeDir = join(import.meta.dirname, "..", "..", "..", "claude");

describe("retiredSyncNames", () => {
	it("names nothing assist still ships", () => {
		const shipped = [
			...readdirSync(join(claudeDir, "commands")).map((file) =>
				file.replace(/\.md$/, ""),
			),
			...readdirSync(join(claudeDir, "skills")),
		];

		expect(
			[...retiredSyncNames.commands, ...retiredSyncNames.skillDirs].filter(
				(name) => shipped.includes(name),
			),
		).toEqual([]);
	});
});
