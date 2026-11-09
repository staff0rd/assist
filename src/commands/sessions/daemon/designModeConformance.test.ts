import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as harnessesModule from "../../../shared/harnesses";
import { createSession } from "./createSession";
import { respawnPlan } from "./respawnPlan";
import { spawnCreate } from "./spawnCreate";
import { spawnPty } from "./spawnPty";
import type { SessionManager } from "./SessionManager";

const designPrompt = resolve(
	__dirname,
	"..",
	"..",
	"..",
	"..",
	"claude",
	"design-system-prompt.md",
);

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./spawnPty", () => ({ spawnPty: vi.fn(() => ({ pid: 1 })) }));
vi.mock("./designSystemPromptPath", () => ({
	designSystemPromptPath: () => designPrompt,
}));
vi.mock("../../../shared/harnesses", async () => ({
	...(await vi.importActual<typeof harnessesModule>(
		"../../../shared/harnesses",
	)),
	isHarnessAvailable: (kind: string) => kind === "codex",
}));
vi.mock("../shared/codex/hasCodexRolloutSync", () => ({
	hasCodexRolloutSync: () => true,
}));
vi.mock("../../../shared/loadConfig", () => ({
	loadConfig: () => ({ harness: { engine: "codex" }, litellm: {} }),
}));

const spawned = () => vi.mocked(spawnPty).mock.calls.map(([argv]) => argv);
const developerInstructions = `developer_instructions=${JSON.stringify(
	readFileSync(designPrompt, "utf8"),
)}`;

describe("design mode on Codex with Claude not installed", () => {
	beforeEach(() => vi.clearAllMocks());

	it("resolves before spawning, and refuses Claude because it is not installed", () => {
		const m = { spawn: vi.fn(() => "9") } as unknown as SessionManager;

		expect(spawnCreate(m, { design: true, harness: "codex", cwd: "/r" })).toBe(
			"9",
		);
		expect(
			spawnCreate(m, { design: true, harness: "claude", cwd: "/r" }),
		).toEqual({
			error: expect.stringContaining("Design mode is unavailable on Claude"),
		});
	});

	it("appends the design prompt on create, restart and resume, never spawning claude", () => {
		const session = createSession("7", {
			prompt: "a login page",
			cwd: "/repo",
			design: true,
			harness: "codex",
		});
		expect(session.design).toBe(true);
		session.harnessSessionId = "conv-1";
		respawnPlan(session)?.spawn();

		const [created, resumed] = spawned();
		expect(created[0]).toBe("codex");
		expect(created).toContain(developerInstructions);
		expect(created.at(-1)).toBe("a login page");
		expect(resumed).toContain(developerInstructions);
		expect(resumed.slice(-2)).toEqual(["resume", "conv-1"]);
		expect(spawned().some((argv) => argv[0] === "claude")).toBe(false);
	});
});
