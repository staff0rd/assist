import { spawn } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../test/mocks/childProcessMock";
import { spawnPi } from "./spawnPi";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const spawnMock = vi.mocked(spawn);

function lastCall() {
	return spawnMock.mock.lastCall as [
		string,
		string[],
		{ cwd?: string; env: Record<string, string | undefined> },
	];
}

describe("spawnPi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		spawnMock.mockReturnValue({ on: vi.fn() } as never);
	});

	it("launches pi in regular TUI mode so the web terminal can scroll its history", () => {
		spawnPi("/refine a696");

		const [command, args, opts] = lastCall();
		expect(command).toBe("pi");
		expect(args).toEqual(["--tui-mode", "regular", "/refine a696"]);
		expect(opts.cwd).toBe(process.cwd());
	});

	it("honours an explicit cwd", () => {
		spawnPi("/refine a696", { cwd: "/repo/x" });

		const [, args, opts] = lastCall();
		expect(args).toEqual(["--tui-mode", "regular", "/refine a696"]);
		expect(opts.cwd).toBe("/repo/x");
	});

	it("strips ASSIST_ACTIVITY_ID and CLAUDE_CODE_CHILD_SESSION from the child env", () => {
		vi.stubEnv("ASSIST_ACTIVITY_ID", "act-1");
		vi.stubEnv("CLAUDE_CODE_CHILD_SESSION", "1");

		spawnPi("/refine a696");

		const [, , opts] = lastCall();
		expect(opts.env).not.toHaveProperty("ASSIST_ACTIVITY_ID");
		expect(opts.env).not.toHaveProperty("CLAUDE_CODE_CHILD_SESSION");
		vi.unstubAllEnvs();
	});

	it("passes a chosen model before the prompt", () => {
		spawnPi("/draft x", { model: "sonnet" });

		const [, args] = lastCall();
		expect(args).toEqual([
			"--tui-mode",
			"regular",
			"--model",
			"sonnet",
			"/draft x",
		]);
	});
});
