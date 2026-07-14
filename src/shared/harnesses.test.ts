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

	it("maps claude to ~/.claude with commands/*.md and CLAUDE.md", () => {
		const claude: Harness = harnesses.claude;
		expect(claude.command).toBe("claude");
		expect(claude.homeDir).toBe(path.join(os.homedir(), ".claude"));
		expect(claude.sync.agentsFile).toBe("CLAUDE.md");
		expect(claude.sync.commandDest("refine")).toBe(
			path.join("commands", "refine.md"),
		);
	});

	it("maps codex to ~/.codex with skills/<name>/SKILL.md and AGENTS.md", () => {
		const codex = harnesses.codex;
		expect(codex.command).toBe("codex");
		expect(codex.homeDir).toBe(path.join(os.homedir(), ".codex"));
		expect(codex.sync.agentsFile).toBe("AGENTS.md");
		expect(codex.sync.commandDest("refine")).toBe(
			path.join("skills", "refine", "SKILL.md"),
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
