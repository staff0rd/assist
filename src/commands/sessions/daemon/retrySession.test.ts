import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { retrySession } from "./retrySession";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({
		onData: vi.fn(),
		onExit: vi.fn(),
	})),
}));

const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;

function makeSession(overrides: Partial<Session>): Session {
	return {
		id: "1",
		name: "repo/session",
		commandType: "claude",
		status: "done",
		startedAt: 123,
		runningMs: 0,
		runningSince: null,
		pty: null,
		scrollback: "old output",
		restored: false,
		...overrides,
	};
}

describe("retrySession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("respawns a run session via assist run", () => {
		const session = makeSession({
			commandType: "run",
			runName: "build",
			runArgs: ["--watch"],
			cwd: "/home/user/repo",
		});

		expect(retrySession(session, new Set(), vi.fn())).toBe(true);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "run", "build", "--watch"],
			"/home/user/repo",
		);
		expect(session.status).toBe("running");
		expect(session.scrollback).toBe("");
		expect(session.restored).toBeUndefined();
	});

	it("respawns an assist session from its persisted args", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["draft"],
			cwd: "/home/user/repo",
		});

		expect(retrySession(session, new Set(), vi.fn())).toBe(true);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "draft"],
			"/home/user/repo",
			"1",
		);
		expect(session.status).toBe("running");
		expect(session.restored).toBeUndefined();
	});

	it("does not retry claude sessions", () => {
		const session = makeSession({ commandType: "claude" });

		expect(retrySession(session, new Set(), vi.fn())).toBe(false);
		expect(spawnPtyMock).not.toHaveBeenCalled();
	});

	it("does not retry an assist session without persisted args", () => {
		const session = makeSession({ commandType: "assist" });

		expect(retrySession(session, new Set(), vi.fn())).toBe(false);
		expect(spawnPtyMock).not.toHaveBeenCalled();
	});
});
