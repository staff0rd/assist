import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { watchClaudeSessionId } from "./watchClaudeSessionId";
import { watchForClaudeSessionId } from "./watchForClaudeSessionId";

vi.mock("./watchClaudeSessionId", () => ({
	watchClaudeSessionId: vi.fn(),
}));

const watchMock = watchClaudeSessionId as unknown as ReturnType<typeof vi.fn>;

type WatchOptions = Parameters<typeof watchClaudeSessionId>[0];

function fakeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		pty: {} as Session["pty"],
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
		cwd: "/repo",
		...overrides,
	};
}

describe("watchForClaudeSessionId", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("records reported sessionIds and notifies", () => {
		watchMock.mockImplementation((options: WatchOptions) => {
			options.onSessionId("abc-123");
			return Promise.resolve();
		});
		const session = fakeSession();
		const sessions = new Map([[session.id, session]]);
		const onDiscovered = vi.fn();

		watchForClaudeSessionId(session, sessions, onDiscovered);

		expect(session.claudeSessionId).toBe("abc-123");
		expect(onDiscovered).toHaveBeenCalled();
	});

	it("follows the card to a newer session", () => {
		watchMock.mockImplementation((options: WatchOptions) => {
			options.onSessionId("phase-1");
			options.onSessionId("phase-2");
			return Promise.resolve();
		});
		const session = fakeSession();
		const sessions = new Map([[session.id, session]]);
		const onDiscovered = vi.fn();

		watchForClaudeSessionId(session, sessions, onDiscovered);

		expect(session.claudeSessionId).toBe("phase-2");
		expect(onDiscovered).toHaveBeenCalledTimes(2);
	});

	it("ignores run sessions", () => {
		const session = fakeSession({ commandType: "run" });

		watchForClaudeSessionId(session, new Map(), vi.fn());

		expect(watchMock).not.toHaveBeenCalled();
	});

	it("watches assist sessions, which can wrap claude", () => {
		watchMock.mockImplementation((options: WatchOptions) => {
			options.onSessionId("abc-123");
			return Promise.resolve();
		});
		const session = fakeSession({ commandType: "assist" });
		const sessions = new Map([[session.id, session]]);
		const onDiscovered = vi.fn();

		watchForClaudeSessionId(session, sessions, onDiscovered);

		expect(session.claudeSessionId).toBe("abc-123");
		expect(onDiscovered).toHaveBeenCalled();
	});

	it("ignores sessions without a pty", () => {
		const session = fakeSession({ pty: null });

		watchForClaudeSessionId(session, new Map(), vi.fn());

		expect(watchMock).not.toHaveBeenCalled();
	});

	it("treats sessionIds held by other sessions as claimed", () => {
		const session = fakeSession();
		const other = fakeSession({ id: "2", claudeSessionId: "taken" });
		const sessions = new Map([
			[session.id, session],
			[other.id, other],
		]);
		watchMock.mockReturnValue(new Promise(() => {}));

		watchForClaudeSessionId(session, sessions, vi.fn());

		const [options] = watchMock.mock.lastCall as [WatchOptions];
		expect(options.isClaimed("taken")).toBe(true);
		expect(options.isClaimed("free")).toBe(false);
		expect(options.isActive()).toBe(true);
	});

	it("does not notify when the session was dismissed before discovery", () => {
		watchMock.mockImplementation((options: WatchOptions) => {
			options.onSessionId("abc-123");
			return Promise.resolve();
		});
		const session = fakeSession();
		const onDiscovered = vi.fn();

		watchForClaudeSessionId(session, new Map(), onDiscovered);

		expect(onDiscovered).not.toHaveBeenCalled();
		expect(session.claudeSessionId).toBeUndefined();
	});
});
