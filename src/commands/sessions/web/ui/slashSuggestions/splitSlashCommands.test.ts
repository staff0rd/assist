import { describe, expect, it } from "vitest";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { splitSlashCommands } from "./splitSlashCommands";

const commands: SlashCommand[] = [
	{ name: "draft", scope: "user" },
	{ name: "review", scope: "project" },
	{ name: "tmp", scope: "user" },
];

const commandText = (text: string) =>
	splitSlashCommands(text, commands)
		.filter((s) => s.command)
		.map((s) => s.text);

describe("splitSlashCommands", () => {
	it("marks known commands and leaves paths plain", () => {
		expect(commandText("/draft see /tmp/notes.md then /review it")).toEqual([
			"/draft",
			"/review",
		]);
	});

	it("keeps every character across segments", () => {
		const text = "/draft see /tmp/notes.md then /review, ok";
		expect(
			splitSlashCommands(text, commands)
				.map((s) => s.text)
				.join(""),
		).toBe(text);
	});

	it("ignores unknown names and slashes inside words", () => {
		expect(commandText("/unknown and/draft a/review")).toEqual([]);
	});

	it("strips trailing punctuation", () => {
		expect(commandText("run /review.")).toEqual(["/review"]);
	});

	it("returns the text plain with no commands", () => {
		expect(splitSlashCommands("/draft", [])).toEqual([
			{ text: "/draft", start: 0, command: false },
		]);
	});
});
