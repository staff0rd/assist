import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { discoverClaudeSessionId } from "./discoverClaudeSessionId";
import { watchForClaudeSessionId } from "./watchForClaudeSessionId";

vi.mock("./discoverClaudeSessionId", () => ({
	discoverClaudeSessionId: vi.fn(),
}));

const discoverMock = discoverClaudeSessionId as unknown as ReturnType<
	typeof vi.fn
>;

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

	it("records the discovered sessionId and notifies", async () => {
		discoverMock.mockResolvedValue("abc-123");
		const session = fakeSession();
		const sessions = new Map([[session.id, session]]);
		const onDiscovered = vi.fn();

		watchForClaudeSessionId(session, sessions, onDiscovered);
		await vi.waitFor(() => expect(onDiscovered).toHaveBeenCalled());

		expect(session.claudeSessionId).toBe("abc-123");
	});

	it("ignores run sessions", () => {
		const session = fakeSession({ commandType: "run" });

		watchForClaudeSessionId(session, new Map(), vi.fn());

		expect(discoverMock).not.toHaveBeenCalled();
	});

	it("watches assist sessions, which can wrap claude", async () => {
		discoverMock.mockResolvedValue("abc-123");
		const session = fakeSession({ commandType: "assist" });
		const sessions = new Map([[session.id, session]]);
		const onDiscovered = vi.fn();

		watchForClaudeSessionId(session, sessions, onDiscovered);
		await vi.waitFor(() => expect(onDiscovered).toHaveBeenCalled());

		expect(session.claudeSessionId).toBe("abc-123");
	});

	it("ignores sessions without a pty", () => {
		const session = fakeSession({ pty: null });

		watchForClaudeSessionId(session, new Map(), vi.fn());

		expect(discoverMock).not.toHaveBeenCalled();
	});

	it("treats sessionIds held by other sessions as claimed", () => {
		const session = fakeSession();
		const other = fakeSession({ id: "2", claudeSessionId: "taken" });
		const sessions = new Map([
			[session.id, session],
			[other.id, other],
		]);
		discoverMock.mockReturnValue(new Promise(() => {}));

		watchForClaudeSessionId(session, sessions, vi.fn());

		const [options] = discoverMock.mock.lastCall as [
			{ isClaimed: (id: string) => boolean; isActive: () => boolean },
		];
		expect(options.isClaimed("taken")).toBe(true);
		expect(options.isClaimed("free")).toBe(false);
		expect(options.isActive()).toBe(true);
	});

	it("does not notify when the session was dismissed before discovery", async () => {
		discoverMock.mockResolvedValue("abc-123");
		const session = fakeSession();
		const onDiscovered = vi.fn();

		watchForClaudeSessionId(session, new Map(), onDiscovered);
		await new Promise((resolve) => setImmediate(resolve));

		expect(onDiscovered).not.toHaveBeenCalled();
		expect(session.claudeSessionId).toBeUndefined();
	});
});
