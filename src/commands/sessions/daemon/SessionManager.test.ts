import { beforeEach, describe, expect, it, vi } from "vitest";
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
vi.mock("./watchForClaudeSessionId", () => ({
	watchForClaudeSessionId: vi.fn(),
}));
vi.mock("./wirePtyEvents", () => ({ wirePtyEvents: vi.fn() }));

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
			restoreSessionMock.mockImplementation(
				(id: string, p: { name: string }) =>
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
	});
});
