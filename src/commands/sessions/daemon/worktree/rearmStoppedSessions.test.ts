import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import { dismissSession } from "../dismissSession";
import { rearmStoppedSessions } from "./rearmStoppedSessions";
import { resolveCloseDurability } from "./resolveCloseDurability";

vi.mock("../dismissSession", () => ({ dismissSession: vi.fn(() => true) }));
vi.mock("./resolveCloseDurability", () => ({
	resolveCloseDurability: vi.fn(() => Promise.resolve()),
}));

const dismissMock = dismissSession as unknown as ReturnType<typeof vi.fn>;
const resolveMock = resolveCloseDurability as unknown as ReturnType<
	typeof vi.fn
>;

const stoppedInTree = {
	id: "1",
	status: "stopped",
	cwd: "/git/repo-2",
	worktree: { path: "/git/repo-2", clone: "/git/repo" },
} satisfies Partial<Session>;

function map(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((s) => [s.id, s]));
}

describe("rearmStoppedSessions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("re-runs the durability gate for a stopped card restored across a restart", () => {
		const s = makeSession(stoppedInTree);

		rearmStoppedSessions(map(s), () => {});

		expect(resolveMock).toHaveBeenCalledTimes(1);
		expect(resolveMock.mock.calls[0]?.[0]).toBe(s);
	});

	it("re-arms a stopped card holding the clone's own tree", () => {
		rearmStoppedSessions(
			map(makeSession({ ...stoppedInTree, worktree: undefined })),
			() => {},
		);

		expect(resolveMock).toHaveBeenCalledTimes(1);
	});

	it("removes the card when the gate now finds the work landed", () => {
		const sessions = map(makeSession(stoppedInTree));
		resolveMock.mockImplementation((_s, finalize: () => void) => {
			finalize();
			return Promise.resolve();
		});
		const notify = vi.fn();

		rearmStoppedSessions(sessions, notify);

		expect(dismissMock).toHaveBeenCalledWith(sessions, "1");
		expect(notify).toHaveBeenCalled();
	});

	it("leaves live and finished cards alone", () => {
		rearmStoppedSessions(
			map(
				makeSession({ ...stoppedInTree, id: "1", status: "running" }),
				makeSession({ ...stoppedInTree, id: "2", status: "done" }),
			),
			() => {},
		);

		expect(resolveMock).not.toHaveBeenCalled();
	});
});
