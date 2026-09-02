import { beforeEach, describe, expect, it, vi } from "vitest";
import { releaseLock } from "../../backlog/acquireLock";
import { createAssistSession } from "./createAssistSession";
import { createRunSession, createSession, type Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { SESSION_TITLE_MAX_LENGTH } from "./generateSessionTitle";
import {
	loadPersistedSessions,
	persistLiveSessions,
} from "./loadPersistedSessions";
import { restartSession } from "./restartSession";
import { restoreSession } from "./restoreSession";
import { SessionManager } from "./SessionManager";
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
vi.mock("./wirePtyEvents", () => ({ wirePtyEvents: vi.fn() }));
vi.mock("./restartSession", () => ({ restartSession: vi.fn(() => true) }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({
		onData: vi.fn(),
		onExit: vi.fn(),
		kill: vi.fn(),
	})),
}));
vi.mock("../../backlog/acquireLock", () => ({ releaseLock: vi.fn() }));
const maxLive = vi.fn(() => 24);
vi.mock("./maxLiveSessions", () => ({ maxLiveSessions: () => maxLive() }));

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
const daemonLogMock = daemonLog as unknown as ReturnType<typeof vi.fn>;
const restartSessionMock = restartSession as unknown as ReturnType<
	typeof vi.fn
>;

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
		runningMs: 0,
		runningSince: 1,
		waitingSince: null,
		pty: { kill: vi.fn() } as unknown as Session["pty"],
		scrollback: "",
		...overrides,
	};
}

describe("SessionManager", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		maxLive.mockReturnValue(24);
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

		it("logs a clear error for a restored session that failed to resume", () => {
			loadPersistedMock.mockReturnValue([
				{
					name: "repo/Session 1",
					commandType: "claude",
					cwd: "/repo",
					startedAt: 1,
				},
			]);
			restoreSessionMock.mockReturnValue(
				fakeSession({
					id: "1",
					name: "repo/Session 1",
					status: "error",
					pty: null,
					restored: false,
					error: "no claude session id was recorded",
				}),
			);

			new SessionManager().restore();

			expect(daemonLogMock).toHaveBeenCalledWith(
				expect.stringContaining("could not resume restored session"),
			);
			expect(daemonLogMock).toHaveBeenCalledWith(
				expect.stringContaining("no claude session id was recorded"),
			);
		});

		it("restores a full-capacity persisted set without dropping any", () => {
			maxLive.mockReturnValue(12);
			loadPersistedMock.mockReturnValue(
				Array.from({ length: 12 }, (_, i) => ({
					id: String(i),
					name: `s${i}`,
					commandType: "claude" as const,
					cwd: "/repo",
					startedAt: 1,
				})),
			);
			restoreSessionMock.mockImplementation((id: string, p: { name: string }) =>
				fakeSession({ id, name: p.name, restored: true }),
			);

			const manager = new SessionManager();
			const restored = manager.restore();

			expect(restored).toHaveLength(12);
			expect(manager.listSessions().map((s) => s.name)).toEqual(
				Array.from({ length: 12 }, (_, i) => `s${i}`),
			);
			expect(daemonLogMock).not.toHaveBeenCalledWith(
				expect.stringContaining("restore capped"),
			);
		});

		it("defers persisted sessions past the cap to stopped cards", () => {
			maxLive.mockReturnValue(12);
			loadPersistedMock.mockReturnValue(
				Array.from({ length: 14 }, (_, i) => ({
					id: String(i),
					name: `s${i}`,
					commandType: "assist" as const,
					assistArgs: ["backlog", "run", `a${i}`],
					cwd: "/repo/tree",
					startedAt: 1,
				})),
			);
			restoreSessionMock.mockImplementation((id: string, p: { name: string }) =>
				fakeSession({ id, name: p.name, restored: true }),
			);

			const manager = new SessionManager();
			const restored = manager.restore();

			expect(restored).toHaveLength(12);
			const listed = manager.listSessions();
			expect(listed.map((s) => s.name)).toEqual(
				Array.from({ length: 14 }, (_, i) => `s${i}`),
			);
			expect(listed.slice(12).map((s) => s.status)).toEqual([
				"stopped",
				"stopped",
			]);
			expect(daemonLogMock).toHaveBeenCalledWith(
				expect.stringContaining(
					'restore capped at 12 (sessions.maxLive): id=12 name="s12" cwd=/repo/tree deferred to stopped card',
				),
			);
		});

		it("logs and surfaces an error session when restore throws", () => {
			loadPersistedMock.mockReturnValue([
				{
					name: "repo/Boom",
					commandType: "claude",
					cwd: "/repo",
					startedAt: 1,
				},
			]);
			restoreSessionMock.mockImplementationOnce(() => {
				throw new Error("pty spawn failed");
			});

			const manager = new SessionManager();
			manager.restore();

			expect(daemonLogMock).toHaveBeenCalledWith(
				expect.stringContaining("pty spawn failed"),
			);
			const listed = manager.listSessions();
			expect(listed).toHaveLength(1);
			expect(listed[0].status).toBe("error");
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

		it("stamps the launching card onto a claude session", () => {
			createSessionMock.mockReturnValue(fakeSession({ name: "new" }));
			const manager = new SessionManager();

			manager.spawn({ prompt: "go" }, { launchedFrom: "2" });

			expect(manager.listSessions()[0].launchedFrom).toBe("2");
		});

		it("stamps the launching card onto a run", () => {
			vi.mocked(createRunSession).mockReturnValue(
				fakeSession({ name: "run: dev", commandType: "run" }),
			);
			const manager = new SessionManager();

			manager.spawnRun({ runName: "dev", runArgs: [] }, { launchedFrom: "2" });

			expect(manager.listSessions()[0].launchedFrom).toBe("2");
		});

		it("stamps the launching card onto an assist session", () => {
			createAssistMock.mockReturnValue(
				fakeSession({ name: "assist review 42", commandType: "assist" }),
			);
			const manager = new SessionManager();

			manager.spawnAssist(["review", "42"], undefined, undefined, {
				launchedFrom: "2",
			});

			expect(manager.listSessions()[0].launchedFrom).toBe("2");
		});

		it("leaves a session with no launching card top-level", () => {
			createSessionMock.mockReturnValue(fakeSession({ name: "new" }));
			const manager = new SessionManager();

			manager.spawn({ prompt: "go" }, { launchedFrom: undefined });

			expect(manager.listSessions()[0].launchedFrom).toBeUndefined();
		});

		it("refuses to spawn past the configured live-session ceiling", () => {
			maxLive.mockReturnValue(3);
			createSessionMock.mockImplementation((id: string) =>
				fakeSession({ id, name: id }),
			);
			const manager = new SessionManager();

			for (let i = 0; i < 3; i++) manager.spawn();

			expect(() => manager.spawn()).toThrow(/sessions\.maxLive/);
			expect(daemonLogMock).toHaveBeenCalledWith(
				expect.stringContaining("at ceiling of 3 live sessions"),
			);
			expect(manager.listSessions()).toHaveLength(3);
		});

		it("allows 24 live sessions by default", () => {
			createSessionMock.mockImplementation((id: string) =>
				fakeSession({ id, name: id }),
			);
			const manager = new SessionManager();

			for (let i = 0; i < 24; i++) manager.spawn();

			expect(manager.listSessions()).toHaveLength(24);
			expect(() => manager.spawn()).toThrow(/ceiling of 24/);
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

	describe("drain", () => {
		it("removes every session, killing ptys and persisting the empty set", () => {
			const killed = vi.fn();
			restoreSessionMock.mockImplementation((id: string) =>
				fakeSession({
					id,
					pty: { kill: killed } as unknown as Session["pty"],
				}),
			);
			loadPersistedMock.mockReturnValue([
				{ name: "a", commandType: "assist", cwd: "/r", startedAt: 1 },
				{ name: "b", commandType: "assist", cwd: "/r", startedAt: 1 },
			]);
			const manager = new SessionManager();
			manager.restore();

			expect(manager.drain()).toBe(2);

			expect(killed).toHaveBeenCalledTimes(2);
			expect(manager.listSessions()).toEqual([]);
			const [sessions] = persistLiveMock.mock.lastCall as [
				Map<string, Session>,
			];
			expect(sessions.size).toBe(0);
		});

		it("returns zero when there are no sessions to drain", () => {
			expect(new SessionManager().drain()).toBe(0);
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

	describe("setTitle", () => {
		it("stores the title and surfaces it in broadcast session state", () => {
			createSessionMock.mockReturnValue(fakeSession({ id: "1" }));
			const manager = new SessionManager();
			manager.spawn();
			const client = { send: vi.fn() };
			manager.addClient(client);
			client.send.mockClear();

			manager.setTitle("1", "  fix login\n redirect  ");

			expect(manager.listSessions()[0]?.title).toBe("fix login redirect");
			const broadcast = client.send.mock.calls
				.map(([raw]) => JSON.parse(raw as string))
				.find((msg) => msg.type === "sessions");
			expect(broadcast.sessions[0].title).toBe("fix login redirect");
		});

		it("truncates an over-long title", () => {
			createSessionMock.mockReturnValue(fakeSession({ id: "1" }));
			const manager = new SessionManager();
			manager.spawn();

			manager.setTitle("1", "a ".repeat(200));

			expect(manager.listSessions()[0]?.title).toHaveLength(
				SESSION_TITLE_MAX_LENGTH,
			);
		});

		it("ignores a whitespace-only title", () => {
			createSessionMock.mockReturnValue(
				fakeSession({ id: "1", title: "kept" }),
			);
			const manager = new SessionManager();
			manager.spawn();
			persistLiveMock.mockClear();

			manager.setTitle("1", "   \n  ");

			expect(manager.listSessions()[0]?.title).toBe("kept");
			expect(persistLiveMock).not.toHaveBeenCalled();
		});

		it("does nothing for an unknown session id", () => {
			const manager = new SessionManager();
			persistLiveMock.mockClear();

			manager.setTitle("missing", "new title");

			expect(persistLiveMock).not.toHaveBeenCalled();
		});
	});

	describe("setStatus", () => {
		it("applies the new status and surfaces it in broadcast session state", () => {
			createSessionMock.mockReturnValue(fakeSession({ id: "1" }));
			const manager = new SessionManager();
			manager.spawn();

			manager.setStatus({ id: "1", status: "waiting" });

			expect(manager.listSessions()[0]?.status).toBe("waiting");
		});

		it("marks the session permission-active on a permission-sourced waiting", () => {
			const session = fakeSession({ id: "1", status: "running" });
			createSessionMock.mockReturnValue(session);
			const manager = new SessionManager();
			manager.spawn();

			manager.setStatus({ id: "1", status: "waiting", source: "permission" });

			expect(session.permissionActive).toBe(true);
		});

		it("clears permission-active whenever the session goes running", () => {
			const session = fakeSession({
				id: "1",
				status: "waiting",
				permissionActive: true,
			});
			createSessionMock.mockReturnValue(session);
			const manager = new SessionManager();
			manager.spawn();

			manager.setStatus({ id: "1", status: "running", source: "pretool" });

			expect(session.permissionActive).toBe(false);
		});

		describe("when the session is unknown", () => {
			it("does nothing", () => {
				const manager = new SessionManager();

				expect(() =>
					manager.setStatus({ id: "missing", status: "running" }),
				).not.toThrow();
			});

			it("warns instead of silently no-opping", () => {
				const manager = new SessionManager();
				daemonLogMock.mockClear();

				manager.setStatus({ id: "missing", status: "waiting" });

				expect(daemonLogMock).toHaveBeenCalledWith(
					expect.stringContaining("unknown session id=missing status=waiting"),
				);
			});
		});

		describe("when the status is unchanged", () => {
			it("does not re-broadcast", () => {
				createSessionMock.mockReturnValue(fakeSession({ id: "1" }));
				const manager = new SessionManager();
				manager.spawn();
				persistLiveMock.mockClear();

				manager.setStatus({ id: "1", status: "running" });

				expect(persistLiveMock).not.toHaveBeenCalled();
			});
		});
	});

	describe("restart", () => {
		it("logs and returns a reason for an unknown session", () => {
			const manager = new SessionManager();
			daemonLogMock.mockClear();

			const result = manager.restart("nope");

			expect(result.ok).toBe(false);
			expect(result.reason).toContain("no longer tracked");
			expect(restartSessionMock).not.toHaveBeenCalled();
			expect(daemonLogMock).toHaveBeenCalledWith(
				expect.stringContaining("unknown session id=nope"),
			);
		});

		it("logs on entry and reports success when the session restarts", () => {
			createSessionMock.mockReturnValue(fakeSession({ id: "1", name: "s" }));
			restartSessionMock.mockReturnValue(true);
			const manager = new SessionManager();
			manager.spawn();
			daemonLogMock.mockClear();

			const result = manager.restart("1");

			expect(result.ok).toBe(true);
			expect(daemonLogMock).toHaveBeenCalledWith(
				expect.stringContaining("restart requested: id=1"),
			);
		});

		it("reports a reason and logs when there is no respawn plan", () => {
			createSessionMock.mockReturnValue(fakeSession({ id: "1", name: "s" }));
			restartSessionMock.mockReturnValue(false);
			const manager = new SessionManager();
			manager.spawn();
			daemonLogMock.mockClear();

			const result = manager.restart("1");

			expect(result.ok).toBe(false);
			expect(result.reason).toContain("can't be restarted");
			expect(daemonLogMock).toHaveBeenCalledWith(
				expect.stringContaining("did nothing: no respawn plan"),
			);
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

		it("drops the launcher the reused card inherited from its last occupant", () => {
			const draft = drive({ launchedFrom: "2" });
			expect(draft.launchedFrom).toBeUndefined();
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
