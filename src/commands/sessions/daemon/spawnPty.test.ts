import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../../test/mocks/fsMock";

vi.mock("node-pty", () => ({
	spawn: vi.fn(() => ({})),
}));

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../test/mocks/fsMock")
	).fsMock(),
);

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

vi.mock("./ensureSpawnHelperExecutable", () => ({
	ensureSpawnHelperExecutable: vi.fn(),
}));

import { existsSync } from "node:fs";
import * as pty from "node-pty";
import { MissingCwdError, spawnPty } from "./spawnPty";

const spawnMock = pty.spawn as unknown as ReturnType<typeof vi.fn>;
const existsMock = vi.mocked(existsSync);

function spawnedEnv(): Record<string, string | undefined> {
	const opts = spawnMock.mock.lastCall?.[2] as
		| { env: Record<string, string | undefined> }
		| undefined;
	return opts?.env ?? {};
}

describe("spawnPty", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(true);
	});

	it("refuses to spawn into a working directory that no longer exists", () => {
		existsMock.mockReturnValue(false);

		expect(() => spawnPty(["claude"], "/git/repo-2", "7")).toThrow(
			MissingCwdError,
		);
		expect(() => spawnPty(["claude"], "/git/repo-2", "7")).toThrow(
			"working directory no longer exists: /git/repo-2",
		);
		expect(spawnMock).not.toHaveBeenCalled();
	});

	it("still spawns when no working directory is given", () => {
		existsMock.mockReturnValue(false);

		spawnPty(["assist", "run", "build"]);

		expect(spawnMock).toHaveBeenCalled();
	});

	it("strips CLAUDE_CODE_CHILD_SESSION so spawned claude sessions stay resumable", () => {
		vi.stubEnv("CLAUDE_CODE_CHILD_SESSION", "1");

		spawnPty(["claude"], "/repo", "7");

		expect(spawnedEnv()).not.toHaveProperty("CLAUDE_CODE_CHILD_SESSION");
		vi.unstubAllEnvs();
	});

	it("marks every spawn with ASSIST_SESSION even without a session id", () => {
		spawnPty(["assist", "run", "build"], "/repo");

		expect(spawnedEnv().ASSIST_SESSION).toBe("1");
	});

	it("sets the activity env vars when a session id is given", () => {
		spawnPty(["assist", "backlog", "run", "402"], "/repo", "7");

		const env = spawnedEnv();
		expect(env.ASSIST_SESSION_ID).toBe("7");
		expect(env.ASSIST_ACTIVITY_ID).toBe("7");
	});
});
