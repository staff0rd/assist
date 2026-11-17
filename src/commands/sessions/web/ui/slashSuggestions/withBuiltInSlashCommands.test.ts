import { describe, expect, it } from "vitest";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { splitSlashCommands } from "./splitSlashCommands";
import { withBuiltInSlashCommands } from "./withBuiltInSlashCommands";

const commands: SlashCommand[] = [{ name: "commit", scope: "user" }];

describe("withBuiltInSlashCommands", () => {
	it("adds /clear as a built-in for claude-sdk sessions", () => {
		expect(withBuiltInSlashCommands("claude-sdk", commands)).toContainEqual({
			name: "clear",
			description: "Start a new conversation in this session",
			scope: "built-in",
		});
	});

	it.each(["claude", "codex"] as const)(
		"leaves %s suggestions unchanged",
		(harness) => {
			expect(withBuiltInSlashCommands(harness, commands)).toBe(commands);
		},
	);

	it("lets a user or project command of the same name win", () => {
		const own: SlashCommand[] = [{ name: "clear", scope: "project" }];
		expect(withBuiltInSlashCommands("claude-sdk", own)).toEqual(own);
	});

	it("highlights /clear as a recognised command", () => {
		const known = withBuiltInSlashCommands("claude-sdk", commands);
		expect(
			splitSlashCommands("/clear", known).filter((s) => s.command),
		).toEqual([expect.objectContaining({ text: "/clear" })]);
	});
});
