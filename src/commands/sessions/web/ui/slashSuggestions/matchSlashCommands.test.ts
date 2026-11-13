import { describe, expect, it } from "vitest";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { matchSlashCommands } from "./matchSlashCommands";

const commands: SlashCommand[] = [
	{ name: "review", scope: "project" },
	{ name: "refine", scope: "user" },
	{ name: "commit", scope: "user" },
	{ name: "Recall", scope: "user" },
];

describe("matchSlashCommands", () => {
	it("filters by name prefix, case-insensitively, user before project", () => {
		expect(matchSlashCommands(commands, "RE").map((c) => c.name)).toEqual([
			"Recall",
			"refine",
			"review",
		]);
	});

	it("returns nothing when no name matches", () => {
		expect(matchSlashCommands(commands, "tmp")).toEqual([]);
	});
});
