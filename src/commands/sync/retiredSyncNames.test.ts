import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { retiredSyncNames } from "./retiredSyncNames";

const agentDir = join(import.meta.dirname, "..", "..", "..", "agent");

describe("retiredSyncNames", () => {
	it("names nothing assist still ships", () => {
		const shipped = [
			...readdirSync(join(agentDir, "commands")).map((file) =>
				file.replace(/\.md$/, ""),
			),
			...readdirSync(join(agentDir, "skills")),
		];

		expect(
			[...retiredSyncNames.commands, ...retiredSyncNames.skillDirs].filter(
				(name) => shipped.includes(name),
			),
		).toEqual([]);
	});
});
