import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { reuseSessionForRun } from "./reuseSessionForRun";
import { spawnPty } from "./spawnPty";
import { wirePtyEvents } from "./wirePtyEvents";

vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({
		onData: vi.fn(),
		onExit: vi.fn(),
		kill: vi.fn(),
	})),
}));
vi.mock("./wirePtyEvents", () => ({ wirePtyEvents: vi.fn() }));

const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;
const wirePtyMock = wirePtyEvents as unknown as ReturnType<typeof vi.fn>;

function makeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "7",
		name: "assist draft --once",
		commandType: "assist",
		status: "done",
		startedAt: 100,
		runningMs: 0,
		runningSince: null,
		pty: null,
		scrollback: "draft transcript",
		assistArgs: ["draft", "--once"],
		cwd: "/home/user/repo",
		...overrides,
	};
}

describe("reuseSessionForRun", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("swaps args and name to the backlog run and respawns on the same id", () => {
		const session = makeSession();

		reuseSessionForRun(session, 42, new Set(), vi.fn());

		expect(session.assistArgs).toEqual(["backlog", "run", "42"]);
		expect(session.name).toBe("assist backlog run 42");
		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "backlog", "run", "42"],
			"/home/user/repo",
			"7",
		);
	});

	it("resets status to running and refreshes startedAt", () => {
		const session = makeSession({ startedAt: 100 });

		reuseSessionForRun(session, 42, new Set(), vi.fn());

		expect(session.status).toBe("running");
		expect(session.startedAt).toBeGreaterThan(100);
	});

	it("preserves scrollback so the draft transcript is not cleared", () => {
		const session = makeSession({ scrollback: "draft transcript" });

		reuseSessionForRun(session, 42, new Set(), vi.fn());

		expect(session.scrollback).toBe("draft transcript");
	});

	it("does not broadcast a clear to clients", () => {
		const client: SessionClient = { send: vi.fn() };
		const session = makeSession();

		reuseSessionForRun(session, 42, new Set([client]), vi.fn());

		expect(client.send).not.toHaveBeenCalled();
	});

	it("re-wires pty events on the reused session", () => {
		const session = makeSession();
		const onStatusChange = vi.fn();
		const clients = new Set<SessionClient>();

		reuseSessionForRun(session, 42, clients, onStatusChange);

		expect(wirePtyMock).toHaveBeenCalledWith(session, clients, onStatusChange);
	});

	it("kills a still-running pty before respawning", () => {
		const kill = vi.fn();
		const session = makeSession({
			status: "running",
			pty: { kill } as unknown as Session["pty"],
		});

		reuseSessionForRun(session, 42, new Set(), vi.fn());

		expect(kill).toHaveBeenCalledOnce();
	});
});
