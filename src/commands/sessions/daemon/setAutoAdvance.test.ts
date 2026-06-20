import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearPause, requestPause } from "../../backlog/consumePause";
import type { Session } from "./createSession";
import { setAutoAdvance } from "./writeToSession";

vi.mock("../../backlog/consumePause", () => ({
	requestPause: vi.fn(),
	clearPause: vi.fn(),
}));

const requestPauseMock = requestPause as unknown as ReturnType<typeof vi.fn>;
const clearPauseMock = clearPause as unknown as ReturnType<typeof vi.fn>;

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "assist",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		pty: null,
		scrollback: "",
		activity: { kind: "backlog", itemId: 42, startedAt: 1 },
		...overrides,
	};
}

describe("setAutoAdvance", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("records the state on the session", () => {
		const sessions = new Map([["1", session()]]);

		setAutoAdvance(sessions, "1", false);

		expect(sessions.get("1")?.autoAdvance).toBe(false);
	});

	it("writes the control file for the item when toggled off", () => {
		const sessions = new Map([["1", session()]]);

		setAutoAdvance(sessions, "1", false);

		expect(requestPauseMock).toHaveBeenCalledWith(42);
		expect(clearPauseMock).not.toHaveBeenCalled();
	});

	it("clears the control file for the item when toggled on", () => {
		const sessions = new Map([["1", session()]]);

		setAutoAdvance(sessions, "1", true);

		expect(clearPauseMock).toHaveBeenCalledWith(42);
		expect(requestPauseMock).not.toHaveBeenCalled();
	});

	it("does not touch the control file when the session has no backlog item", () => {
		const sessions = new Map([["1", session({ activity: undefined })]]);

		setAutoAdvance(sessions, "1", false);

		expect(requestPauseMock).not.toHaveBeenCalled();
		expect(clearPauseMock).not.toHaveBeenCalled();
	});

	it("returns false for an unknown session", () => {
		expect(setAutoAdvance(new Map(), "missing", false)).toBe(false);
	});
});
