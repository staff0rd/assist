import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node-pty", () => ({
	spawn: vi.fn(() => ({})),
}));

vi.mock("./ensureSpawnHelperExecutable", () => ({
	ensureSpawnHelperExecutable: vi.fn(),
}));

import * as pty from "node-pty";
import { spawnPty } from "./spawnPty";

const spawnMock = pty.spawn as unknown as ReturnType<typeof vi.fn>;

function spawnedEnv(): Record<string, string | undefined> {
	const opts = spawnMock.mock.lastCall?.[2] as
		| { env: Record<string, string | undefined> }
		| undefined;
	return opts?.env ?? {};
}

describe("spawnPty", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("strips CLAUDE_CODE_CHILD_SESSION so spawned claude sessions stay resumable", () => {
		vi.stubEnv("CLAUDE_CODE_CHILD_SESSION", "1");

		spawnPty(["claude"], "/repo", "7");

		expect(spawnedEnv()).not.toHaveProperty("CLAUDE_CODE_CHILD_SESSION");
		vi.unstubAllEnvs();
	});

	it("sets the activity env vars when a session id is given", () => {
		spawnPty(["assist", "backlog", "run", "402"], "/repo", "7");

		const env = spawnedEnv();
		expect(env.ASSIST_SESSION_ID).toBe("7");
		expect(env.ASSIST_ACTIVITY_ID).toBe("7");
	});
});
