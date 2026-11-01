import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { closeChildServerRuns } from "./closeChildServerRuns";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const worktree = { path: "/git/repo-2", clone: "/git/repo" };

function mapOf(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((s) => [s.id, s]));
}

function closedBy(sessions: Map<string, Session>, parentId = "1"): string[] {
	const close = vi.fn();
	closeChildServerRuns(sessions, parentId, close);
	return close.mock.calls.map(([id]) => id);
}

describe("closeChildServerRuns", () => {
	beforeEach(() => vi.clearAllMocks());

	it("closes a server run launched from the parent and logs it", () => {
		const parent = makeSession({ id: "1", cwd: "/git/repo" });
		const run = makeSession({
			id: "2",
			commandType: "run",
			server: true,
			launchedFrom: "1",
			cwd: "/elsewhere",
		});

		expect(closedBy(mapOf(parent, run))).toEqual(["2"]);
		expect(daemonLog).toHaveBeenCalledWith("closing server run 2 with 1");
	});

	it("closes a server run sharing the parent's worktree", () => {
		const parent = makeSession({ id: "1", cwd: "/git/repo-2", worktree });
		const run = makeSession({
			id: "2",
			commandType: "run",
			server: true,
			cwd: "/git/repo-2",
		});

		expect(closedBy(mapOf(parent, run))).toEqual(["2"]);
	});

	it("leaves non-server children alone", () => {
		const parent = makeSession({ id: "1", cwd: "/git/repo-2", worktree });
		const agent = makeSession({
			id: "2",
			launchedFrom: "1",
			cwd: "/git/repo-2",
		});
		const run = makeSession({
			id: "3",
			commandType: "run",
			launchedFrom: "1",
			cwd: "/git/repo-2",
		});

		expect(closedBy(mapOf(parent, agent, run))).toEqual([]);
	});

	it("excludes the parent even when it is itself a server run", () => {
		const parent = makeSession({
			id: "1",
			server: true,
			cwd: "/git/repo-2",
			worktree,
		});

		expect(closedBy(mapOf(parent))).toEqual([]);
	});

	it("ignores server runs in an unrelated tree or the clone", () => {
		const parent = makeSession({ id: "1", cwd: "/git/repo" });
		const run = makeSession({
			id: "2",
			commandType: "run",
			server: true,
			cwd: "/git/repo",
		});

		expect(closedBy(mapOf(parent, run))).toEqual([]);
	});

	it("does nothing for an unknown parent", () => {
		expect(closedBy(mapOf(), "9")).toEqual([]);
	});
});
