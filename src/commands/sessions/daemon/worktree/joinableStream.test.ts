import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import { makeSession } from "../../../../test/mothers/makeSession";
import { joinableStream } from "./joinableStream";

vi.mock("node:fs", () => ({ existsSync: vi.fn(() => true) }));

const exists = vi.mocked(existsSync);

const stream = {
	id: "3",
	commandType: "assist",
	status: "running",
	cwd: "/git/repo-2",
	worktree: { path: "/git/repo-2", clone: "/git/repo" },
} satisfies Partial<Session>;

function ask(target: Session | undefined, id = "3") {
	const sessions = new Map<string, Session>();
	if (target) sessions.set(target.id, target);
	return joinableStream(sessions, id);
}

beforeEach(() => {
	exists.mockReset();
	exists.mockReturnValue(true);
});

describe("joinableStream", () => {
	it("takes another agent into a working session", () => {
		const target = makeSession(stream);
		expect(ask(target)).toEqual({ session: target });
	});

	it("takes another agent into a finished, errored or stopped session", () => {
		for (const status of ["done", "error", "stopped"] as const) {
			const target = makeSession({ ...stream, status });
			expect(ask(target)).toEqual({ session: target });
		}
	});

	it("refuses a session that is gone", () => {
		expect(ask(undefined)).toEqual({ reason: "no such session" });
	});

	it("hands back the reason a found session cannot be joined", () => {
		expect(ask(makeSession({ ...stream, commandType: "run" }))).toEqual({
			reason: "a server run has no agent stream",
		});
		exists.mockReturnValue(false);
		expect(ask(makeSession(stream))).toEqual({
			reason: "the session's workspace no longer exists",
		});
	});
});
