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

	it("maps prompt and tool-use events to running and stop events to waiting", () => {
		ensureHooksSettings();

		const written = JSON.parse(writeMock.mock.calls[0][1]);
		const command = (event: string) => written.hooks[event][0].hooks[0].command;
		expect(command("UserPromptSubmit")).toBe(
			"assist sessions set-status running",
		);
		expect(command("PreToolUse")).toBe("assist sessions set-status running");
		expect(command("Stop")).toBe("assist sessions set-status waiting");
		expect(command("Notification")).toBe("assist sessions set-status waiting");
	});
});
