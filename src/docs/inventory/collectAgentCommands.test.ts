import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { collectAgentCommands } from "./collectAgentCommands";

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "claude-dir-"));
	mkdirSync(join(dir, "commands"));
	mkdirSync(join(dir, "skills", "deploy-flow"), { recursive: true });
	mkdirSync(join(dir, "skills", "empty"));
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
});

describe("collectClaudeCommands", () => {
	it("lists commands, flat skills and directory skills with descriptions", () => {
		writeFileSync(
			join(dir, "commands", "commit.md"),
			"---\ndescription: Commit relevant files\n---\n\nBody",
		);
		writeFileSync(join(dir, "commands", "notes.txt"), "ignored");
		writeFileSync(join(dir, "skills", "wireframe.md"), "# Wireframe\n");
		writeFileSync(
			join(dir, "skills", "deploy-flow", "SKILL.md"),
			"---\nname: deploy-flow\ndescription: Install a deploy workflow\n---\n",
		);

		expect(collectAgentCommands(dir)).toEqual([
			{ id: "claude:commit", description: "Commit relevant files" },
			{ id: "skill:deploy-flow", description: "Install a deploy workflow" },
			{ id: "skill:wireframe", description: "" },
		]);
	});
});
