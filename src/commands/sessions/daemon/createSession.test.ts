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

		expect(spawnedArgs()).toEqual(["codex", "--no-daemon", "go"]);
	});

	it("adds no approvals flag to a pi launch", () => {
		createSession("3", {
			prompt: "go",
			cwd: "/repo",
			auto: true,
			harness: "pi",
		});

		expect(spawnedArgs()).toEqual(["pi", "go"]);
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
