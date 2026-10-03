import { describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { liveServerRun, stopServerSession } from "./liveServerRun";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const liveServer: Partial<Session> = {
	id: "1",
	name: "run: dev",
	commandType: "run",
	status: "running",
	server: true,
	serverOrigin: "gh/o/r",
	serverGroup: "default",
};

function map(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((s) => [s.id, s]));
}

describe("liveServerRun", () => {
	it("returns a live server run matching the origin and group", () => {
		expect(
			liveServerRun(map(makeSession(liveServer)), "gh/o/r", "default")?.id,
		).toBe("1");
	});

	it("ignores done/error servers so the slot frees on exit", () => {
		const sessions = map(
			makeSession({ ...liveServer, status: "done" }),
			makeSession({ ...liveServer, id: "2", status: "error" }),
		);
		expect(liveServerRun(sessions, "gh/o/r", "default")).toBeUndefined();
	});

	it("ignores non-server runs and other origins", () => {
		const sessions = map(
			makeSession({ ...liveServer, server: undefined }),
			makeSession({ ...liveServer, id: "2", serverOrigin: "gh/o/other" }),
		);
		expect(liveServerRun(sessions, "gh/o/r", "default")).toBeUndefined();
	});

	it("excludes the given session id", () => {
		expect(
			liveServerRun(map(makeSession(liveServer)), "gh/o/r", "default", "1"),
		).toBeUndefined();
	});

	it("matches another run sharing the same group", () => {
		const sessions = map(
			makeSession({ ...liveServer, id: "1", serverGroup: "web" }),
		);
		expect(liveServerRun(sessions, "gh/o/r", "web")?.id).toBe("1");
	});

	it("ignores a live server in a different group", () => {
		const sessions = map(
			makeSession({ ...liveServer, id: "1", serverGroup: "api" }),
		);
		expect(liveServerRun(sessions, "gh/o/r", "web")).toBeUndefined();
	});

	it("lets api and web servers hold their own slots for one origin", () => {
		const sessions = map(
			makeSession({ ...liveServer, id: "1", serverGroup: "api" }),
			makeSession({ ...liveServer, id: "2", serverGroup: "web" }),
		);
		expect(liveServerRun(sessions, "gh/o/r", "api")?.id).toBe("1");
		expect(liveServerRun(sessions, "gh/o/r", "web")?.id).toBe("2");
	});

	it("keeps a group singleton across sibling clones of the same remote", () => {
		const sessions = map(
			makeSession({ ...liveServer, id: "1", cwd: "/clone-a" }),
		);
		expect(liveServerRun(sessions, "gh/o/r", "default")?.id).toBe("1");
	});
});

describe("stopServerSession", () => {
	it("flags stopping and kills a live pty", () => {
		const { pty } = makePty();
		const s = makeSession({ ...liveServer, pty });
		stopServerSession(map(s), "1");
		expect(s.stopping).toBe(true);
		expect(pty.kill).toHaveBeenCalledOnce();
	});

	it("does nothing for an already-finished session", () => {
		const { pty } = makePty();
		const s = makeSession({ ...liveServer, status: "done", pty });
		stopServerSession(map(s), "1");
		expect(pty.kill).not.toHaveBeenCalled();
	});
});
