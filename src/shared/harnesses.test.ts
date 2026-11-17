import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockCheckCliAvailable = vi.fn();

vi.mock("./checkCliAvailable", () => ({
	checkCliAvailable: (cli: string) => mockCheckCliAvailable(cli),
}));

import {
	type Harness,
	type HarnessKind,
	harnesses,
	isHarnessAvailable,
} from "./harnesses";

describe("harnesses registry", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("maps claude to ~/.claude with skills/<name>/SKILL.md", () => {
		const claude: Harness = harnesses.claude;
		expect(claude.command).toBe("claude");
		expect(claude.homeDir).toBe(path.join(os.homedir(), ".claude"));
		expect(claude.sync.commandDest("refine")).toBe(
			path.join("skills", "refine", "SKILL.md"),
		);
	});

	it.each(["codex", "codex-sdk"] as const)(
		"discovers %s slash commands in the Codex home, ~/.agents and the project's .agents and .codex",
		(kind) => {
			expect(harnesses[kind].slashCommandSources).toEqual({
				userHomes: [
					path.join(os.homedir(), ".codex"),
					path.join(os.homedir(), ".agents"),
				],
				projectDirs: [".agents", ".codex"],
			});
		},
	);

	it.each(["claude", "claude-sdk"] as const)(
		"discovers %s slash commands in ~/.claude and the project's .claude",
		(kind) => {
			expect(harnesses[kind].slashCommandSources).toEqual({
				userHomes: [path.join(os.homedir(), ".claude")],
				projectDirs: [".claude"],
			});
		},
	);

	it("maps codex to ~/.codex with skills/<name>/SKILL.md", () => {
		const codex = harnesses.codex;
		expect(codex.command).toBe("codex");
		expect(codex.homeDir).toBe(path.join(os.homedir(), ".codex"));
		expect(codex.sync.commandDest("refine")).toBe(
			path.join("skills", "refine", "SKILL.md"),
		);
	});

	it("maps pi to ~/.pi/agent with prompts/<name>.md", () => {
		const pi = harnesses.pi;
		expect(pi.command).toBe("pi");
		expect(pi.homeDir).toBe(path.join(os.homedir(), ".pi", "agent"));
		expect(pi.sync.commandDest("refine")).toBe(
			path.join("prompts", "refine.md"),
		);
	});
});

describe("isHarnessAvailable", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("checks the harness command on PATH", () => {
		const kind: HarnessKind = "codex";
		mockCheckCliAvailable.mockReturnValue(true);
		expect(isHarnessAvailable(kind)).toBe(true);
		expect(mockCheckCliAvailable).toHaveBeenCalledWith("codex");
	});

	it("returns false when the command is not on PATH", () => {
		mockCheckCliAvailable.mockReturnValue(false);
		expect(isHarnessAvailable("codex")).toBe(false);
	});
});
