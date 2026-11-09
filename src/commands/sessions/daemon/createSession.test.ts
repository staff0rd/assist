import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSession } from "./createSession";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnPty", () => ({ spawnPty: vi.fn(() => ({ fake: "pty" })) }));

vi.mock("../../../shared/codexSessionEnvArgs", () => ({
	codexSessionEnvArgs: vi.fn(() => []),
}));

vi.mock("./ensureHooksSettings", () => ({
	ensureHooksSettings: vi.fn(() => "/hooks.json"),
}));

vi.mock("./designSystemPromptPath", () => ({
	designSystemPromptPath: vi.fn(() => "/design-system-prompt.md"),
}));

const spawnPtyMock = vi.mocked(spawnPty);

function spawnedArgs(): string[] {
	return spawnPtyMock.mock.calls.at(-1)?.[0] ?? [];
}

describe("createSession", () => {
	beforeEach(() => spawnPtyMock.mockClear());

	it("launches claude in auto mode when the launcher asked for it", () => {
		createSession("3", { prompt: "go", cwd: "/repo", auto: true });

		expect(spawnedArgs()).toEqual(
			expect.arrayContaining(["--permission-mode", "auto"]),
		);
	});

	it("launches claude in the default permission mode otherwise", () => {
		createSession("3", { prompt: "go", cwd: "/repo" });

		expect(spawnedArgs()).not.toContain("--permission-mode");
	});

	it("adds no approvals flag to a codex launch", () => {
		createSession("3", {
			prompt: "go",
			cwd: "/repo",
			auto: true,
			harness: "codex",
		});

		expect(spawnedArgs()).toEqual([
			"codex",
			"--no-daemon",
			"-c",
			"sandbox_workspace_write.network_access=true",
			"go",
		]);
	});

	it("adds no approvals flag to a pi launch", () => {
		createSession("3", {
			prompt: "go",
			cwd: "/repo",
			auto: true,
			harness: "pi",
		});

		expect(spawnedArgs()).toEqual(["pi", "--tui-mode", "regular", "go"]);
	});

	it("still appends the design system prompt for a design launch", () => {
		createSession("3", { prompt: "make it pop", cwd: "/repo", design: true });

		expect(spawnedArgs()).toEqual(
			expect.arrayContaining([
				"--append-system-prompt-file",
				"/design-system-prompt.md",
				"--permission-mode",
				"auto",
			]),
		);
	});

	it("defers the spawn while the workspace is still seeding", () => {
		const session = createSession("3", {
			prompt: "go",
			cwd: "/repo",
			auto: true,
			holdPty: true,
		});

		expect(session.pty).toBeNull();
		expect(spawnPtyMock).not.toHaveBeenCalled();
	});
});

describe("createSession launch identity", () => {
	beforeEach(() => spawnPtyMock.mockClear());

	it("keeps the legacy claude record: a preassigned claudeSessionId and no harness", () => {
		const session = createSession("3", { prompt: "go", cwd: "/repo" });

		expect(session.harness).toBeUndefined();
		expect(session.commandType).toBe("claude");
		expect(session.claudeSessionId).toMatch(/^[0-9a-f-]{36}$/);
		expect(spawnedArgs()).toEqual(
			expect.arrayContaining(["--session-id", session.claudeSessionId]),
		);
	});

	it.each(["codex", "pi"] as const)(
		"records %s as the harness and leaves the conversation id to be bound later",
		(harness) => {
			const session = createSession("4", {
				prompt: "go",
				cwd: "/repo",
				harness,
			});

			expect(session.harness).toBe(harness);
			expect(session.commandType).toBe("claude");
			expect(session.claudeSessionId).toBeUndefined();
			expect(session.harnessSessionId).toBeUndefined();
			expect(session.initialPrompt).toBe("go");
		},
	);

	it("opens an unprompted session waiting for the first input", () => {
		expect(createSession("5", { cwd: "/repo", harness: "codex" }).status).toBe(
			"waiting",
		);
		expect(createSession("6", { prompt: "go", cwd: "/repo" }).status).toBe(
			"running",
		);
	});
});
