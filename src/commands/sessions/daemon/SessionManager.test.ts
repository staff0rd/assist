import { beforeEach, describe, expect, it, vi } from "vitest";
import { releaseLock } from "../../backlog/acquireLock";
import { createAssistSession } from "./createAssistSession";
import { createSession, type Session } from "./createSession";
import {
	loadPersistedSessions,
	persistLiveSessions,
} from "./loadPersistedSessions";
import { restoreSession } from "./restoreSession";
import { SessionManager } from "./SessionManager";
import { watchForClaudeSessionId } from "./watchForClaudeSessionId";
import { wirePtyEvents } from "./wirePtyEvents";

vi.mock("./createSession", () => ({
	createSession: vi.fn(),
	createRunSession: vi.fn(),
}));
vi.mock("./resumeSession", () => ({ resumeSession: vi.fn() }));
vi.mock("./createAssistSession", () => ({ createAssistSession: vi.fn() }));
vi.mock("./restoreSession", () => ({ restoreSession: vi.fn() }));
vi.mock("./loadPersistedSessions", () => ({
	loadPersistedSessions: vi.fn(() => []),
	persistLiveSessions: vi.fn(),
}));
vi.mock("./loadActiveSelection", () => ({
	loadActiveSelection: vi.fn(() => ({})),
	saveActiveSelection: vi.fn(),
}));
vi.mock("./watchForClaudeSessionId", () => ({
	watchForClaudeSessionId: vi.fn(),
}));
vi.mock("./wirePtyEvents", () => ({ wirePtyEvents: vi.fn() }));
vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({
		onData: vi.fn(),
		onExit: vi.fn(),
		kill: vi.fn(),
	})),
}));
vi.mock("../../backlog/acquireLock", () => ({ releaseLock: vi.fn() }));

const releaseLockMock = releaseLock as unknown as ReturnType<typeof vi.fn>;

const loadPersistedMock = loadPersistedSessions as unknown as ReturnType<
	typeof vi.fn
>;
const persistLiveMock = persistLiveSessions as unknown as ReturnType<
	typeof vi.fn
>;
const restoreSessionMock = restoreSession as unknown as ReturnType<
	typeof vi.fn
>;
const createSessionMock = createSession as unknown as ReturnType<typeof vi.fn>;
const createAssistMock = createAssistSession as unknown as ReturnType<
	typeof vi.fn
>;
const wirePtyMock = wirePtyEvents as unknown as ReturnType<typeof vi.fn>;

type StatusChange = (
	s: Session,
	status: Session["status"],
	exitCode?: number,
) => void;

function lastStatusChange(): StatusChange {
	return wirePtyMock.mock.lastCall?.[2] as StatusChange;
}

function fakeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		pty: { kill: vi.fn() } as unknown as Session["pty"],
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
		...overrides,
	};
}

describe("SessionManager", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("restore", () => {
		it("respawns resumable claude sessions and stubs the rest", () => {
			loadPersistedMock.mockReturnValue([
				{
					name: "live",
					commandType: "claude",
					cwd: "/repo",
					startedAt: 1,
					claudeSessionId: "abc",
				},
				{ name: "stub", commandType: "run", cwd: "/repo", startedAt: 1 },
			]);
			restoreSessionMock.mockImplementation((id: string, p: { name: string }) =>
				p.name === "live"
					? fakeSession({ id, name: "live", restored: true })
					: fakeSession({
							id,
							name: "stub",
							commandType: "run",
							status: "done",
							pty: null,
							restored: false,
						}),
			);

			const manager = new SessionManager();
			manager.restore();

			expect(restoreSessionMock).toHaveBeenCalledTimes(2);
			const listed = manager.listSessions();
			expect(listed.map((s) => [s.name, s.restored])).toEqual([
				["live", true],
				["stub", false],
			]);
		});

		it("watches restored sessions for a new claude sessionId", () => {
			const session = fakeSession({ restored: true, cwd: "/repo" });
			loadPersistedMock.mockReturnValue([
				{
					name: "live",
					commandType: "claude",
					cwd: "/repo",
					startedAt: 1,
					claudeSessionId: "abc",
				},
			]);
			restoreSessionMock.mockReturnValue(session);

			new SessionManager().restore();

			expect(watchForClaudeSessionId).toHaveBeenCalledWith(
				session,
				expect.any(Map),
				expect.any(Function),
			);
		});
	});

	describe("spawn", () => {
		it("persists the new session", () => {
			createSessionMock.mockReturnValue(fakeSession({ name: "new" }));

			new SessionManager().spawn();

			const [sessions] = persistLiveMock.mock.lastCall as [
				Map<string, Session>,
			];
			expect([...sessions.values()].map((s) => s.name)).toEqual(["new"]);
		});
	});

	describe("idle signalling", () => {
		it("reports idle when the last client disconnects with no sessions", () => {
			const onIdleChange = vi.fn();
			const manager = new SessionManager(onIdleChange);
			const client = { send: vi.fn() };

			manager.addClient(client);
			expect(onIdleChange).toHaveBeenLastCalledWith(false);

			manager.removeClient(client);
			expect(onIdleChange).toHaveBeenLastCalledWith(true);
		});

		it("reports busy while sessions exist even without clients", () => {
			createSessionMock.mockReturnValue(fakeSession({ id: "1" }));
			const onIdleChange = vi.fn();
			const manager = new SessionManager(onIdleChange);

			manager.spawn();
			expect(onIdleChange).toHaveBeenLastCalledWith(false);

			manager.dismissSession("1");
			expect(onIdleChange).toHaveBeenLastCalledWith(true);
		});
	});

	describe("shutdown", () => {
		it("kills live ptys and ignores their exit events", () => {
			const kill = vi.fn();
			const session = fakeSession({
				id: "1",
				pty: { kill } as unknown as Session["pty"],
			});
			createSessionMock.mockReturnValue(session);
			const manager = new SessionManager();
			manager.spawn();
			const [, , onStatusChange] = (
				wirePtyEvents as unknown as ReturnType<typeof vi.fn>
			).mock.lastCall as [
				Session,
				unknown,
				(s: Session, status: Session["status"]) => void,
			];
			persistLiveMock.mockClear();

			manager.shutdown();
			onStatusChange(session, "done");

			expect(kill).toHaveBeenCalledOnce();
			expect(persistLiveMock).not.toHaveBeenCalled();
		});
	});

	describe("dismissSession", () => {
		it("updates persistence after removal", () => {
			createSessionMock.mockReturnValue(fakeSession({ id: "1" }));
			const manager = new SessionManager();
			manager.spawn();

			manager.dismissSession("1");

			const [sessions] = persistLiveMock.mock.lastCall as [
				Map<string, Session>,
			];
			expect(sessions.size).toBe(0);
			expect(manager.listSessions()).toEqual([]);
		});

		it("releases the lock for a backlog session being dismissed", () => {
			createSessionMock.mockReturnValue(
				fakeSession({
					id: "1",
					activity: { kind: "backlog", itemId: 301, startedAt: 1 },
				}),
			);
			const manager = new SessionManager();
			manager.spawn();

			manager.dismissSession("1");

			expect(releaseLockMock).toHaveBeenCalledWith(301);
		});

		it("does not release a lock for a session without a backlog item", () => {
			createSessionMock.mockReturnValue(fakeSession({ id: "1" }));
			const manager = new SessionManager();
			manager.spawn();

			manager.dismissSession("1");

			expect(releaseLockMock).not.toHaveBeenCalled();
		});
	});

	describe("active selection", () => {
		it("broadcasts the per-repo selection to connected clients", () => {
			const manager = new SessionManager();
			const client = { send: vi.fn() };
			manager.addClient(client);
			client.send.mockClear();

			manager.active.set("/repo", "1");

			const broadcast = client.send.mock.calls
				.map(([raw]) => JSON.parse(raw as string))
				.find((msg) => msg.type === "sessions");
			expect(broadcast.active).toEqual({ "/repo": "1" });
		});

		it("does not broadcast when the cwd is empty", () => {
			const manager = new SessionManager();
			const client = { send: vi.fn() };
			manager.addClient(client);
			client.send.mockClear();

			manager.active.set("", "1");

			expect(client.send).not.toHaveBeenCalled();
		});
	});

	describe("setAutoRun", () => {
		it("stores the flag and surfaces it in broadcast session state", () => {
			createSessionMock.mockReturnValue(fakeSession({ id: "1" }));
			const manager = new SessionManager();
			manager.spawn();

			manager.setAutoRun("1", true);

			expect(manager.listSessions()[0]?.autoRun).toBe(true);
		});
	});

	describe("auto-run on done", () => {
		function drive(overrides: Partial<Session>): Session {
			const draft = fakeSession({
				id: "1",
				commandType: "assist",
				assistArgs: ["draft", "--once"],
				pty: null,
				autoRun: true,
				activity: { kind: "command", itemId: 42, startedAt: 1 },
				...overrides,
			});
			createAssistMock.mockReturnValueOnce(draft);
			const manager = new SessionManager();
			manager.spawnAssist(["draft", "--once"]);
			lastStatusChange()(draft, "done", 0);
			return draft;
		}

		it("reuses the draft card to run 'backlog run <id>' when it exits cleanly", () => {
			const draft = drive({});
			expect(draft.assistArgs).toEqual(["backlog", "run", "42"]);
			expect(draft.name).toBe("assist backlog run 42");
			expect(draft.status).toBe("running");
			expect(createAssistMock).toHaveBeenCalledTimes(1);
		});

		it("reuses a refine card to run 'backlog run <id>' when it exits cleanly", () => {
			const refine = drive({ assistArgs: ["refine", "--once"] });
			expect(refine.assistArgs).toEqual(["backlog", "run", "42"]);
			expect(refine.name).toBe("assist backlog run 42");
			expect(refine.status).toBe("running");
			expect(createAssistMock).toHaveBeenCalledTimes(1);
		});

		it("does not reuse the card when autoRun is off", () => {
			const draft = drive({ autoRun: false });
			expect(draft.assistArgs).toEqual(["draft", "--once"]);
			expect(createAssistMock).toHaveBeenCalledTimes(1);
		});

		it("does not reuse the card when no item was created", () => {
			const draft = drive({ activity: undefined });
			expect(draft.assistArgs).toEqual(["draft", "--once"]);
			expect(createAssistMock).toHaveBeenCalledTimes(1);
		});
	});
});
