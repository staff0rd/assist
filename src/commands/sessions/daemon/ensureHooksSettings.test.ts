import { mkdirSync, writeFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { daemonPaths } from "./daemonPaths";
import { ensureHooksSettings } from "./ensureHooksSettings";

vi.mock("node:fs", () => ({
	mkdirSync: vi.fn(),
	writeFileSync: vi.fn(),
}));

const writeMock = writeFileSync as unknown as ReturnType<typeof vi.fn>;
const mkdirMock = mkdirSync as unknown as ReturnType<typeof vi.fn>;

type HookEntry = { matcher?: string; hooks: { command: string }[] };

describe("ensureHooksSettings", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns the hooks settings path", () => {
		expect(ensureHooksSettings()).toBe(daemonPaths.hooksSettings);
	});

	it("creates the daemon directory before writing", () => {
		ensureHooksSettings();

		expect(mkdirMock).toHaveBeenCalledWith(expect.any(String), {
			recursive: true,
		});
	});

	it("maps prompt and tool-use events to running best-effort hints (no ack)", () => {
		ensureHooksSettings();

		const written = JSON.parse(writeMock.mock.calls[0][1]);
		expect(written.hooks.UserPromptSubmit[0].hooks[0].command).toBe(
			"assist sessions set-status running --source prompt",
		);
		expect(written.hooks.PostToolUse[0].hooks[0].command).toBe(
			"assist sessions set-status running --source posttool",
		);
	});

	it("uses ack'd delivery for the blocking and terminal set only", () => {
		ensureHooksSettings();

		const written = JSON.parse(writeMock.mock.calls[0][1]);
		expect(written.hooks.PermissionRequest[0].hooks[0].command).toBe(
			"assist sessions set-status waiting --source permission --ack",
		);
		expect(written.hooks.Stop[0].hooks[0].command).toBe(
			"assist sessions set-status waiting --source stop --ack",
		);
		expect(written.hooks.Notification[0].hooks[0].command).toBe(
			"assist sessions set-status waiting --source notification --ack",
		);
	});

	it("does not ack any PreToolUse or PostToolUse hook", () => {
		ensureHooksSettings();

		const written = JSON.parse(writeMock.mock.calls[0][1]);
		const toolCommands = [
			...written.hooks.PreToolUse.map((e: HookEntry) => e.hooks[0].command),
			written.hooks.PostToolUse[0].hooks[0].command,
			written.hooks.UserPromptSubmit[0].hooks[0].command,
		];
		for (const command of toolCommands) expect(command).not.toContain("--ack");
	});

	it("sets waiting for AskUserQuestion as a best-effort hint (no ack, derivable)", () => {
		ensureHooksSettings();

		const written = JSON.parse(writeMock.mock.calls[0][1]);
		const askEntry = written.hooks.PreToolUse.find(
			(e: HookEntry) => e.matcher === "AskUserQuestion",
		) as HookEntry;
		expect(askEntry.hooks[0].command).toBe(
			"assist sessions set-status waiting --source pretool",
		);
	});

	it("keeps running for normal tools and excludes AskUserQuestion from it", () => {
		ensureHooksSettings();

		const written = JSON.parse(writeMock.mock.calls[0][1]);
		const runningEntry = written.hooks.PreToolUse.find(
			(e: HookEntry) =>
				e.hooks[0].command ===
				"assist sessions set-status running --source pretool",
		) as HookEntry;
		const matcher = runningEntry.matcher ?? "";
		expect(matcher).toBe("^(?!AskUserQuestion$).*");
		const matches = new RegExp(matcher);
		expect(matches.test("Bash")).toBe(true);
		expect(matches.test("Edit")).toBe(true);
		expect(matches.test("AskUserQuestion")).toBe(false);
	});
});
