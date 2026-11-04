import { describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { liveServerRun, stopServerSession } from "./liveServerRun";
import type { ServerRunMeta } from "./serverRunMeta";

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

function slot(group: string, origin = "gh/o/r", port?: number): ServerRunMeta {
	return { server: true, origin, group, port };
}

describe("liveServerRun", () => {
	it("returns a live server run matching the origin and group", () => {
		expect(
			liveServerRun(map(makeSession(liveServer)), slot("default"))?.id,
		).toBe("1");
	});

	it("ignores done/error servers so the slot frees on exit", () => {
		const sessions = map(
			makeSession({ ...liveServer, status: "done" }),
			makeSession({ ...liveServer, id: "2", status: "error" }),
		);
		expect(liveServerRun(sessions, slot("default"))).toBeUndefined();
	});

	it("ignores non-server runs and other origins", () => {
		const sessions = map(
			makeSession({ ...liveServer, server: undefined }),
			makeSession({ ...liveServer, id: "2", serverOrigin: "gh/o/other" }),
		);
		expect(liveServerRun(sessions, slot("default"))).toBeUndefined();
	});

	it("excludes the given session id", () => {
		expect(
			liveServerRun(map(makeSession(liveServer)), slot("default"), "1"),
		).toBeUndefined();
	});

	it("matches another run sharing the same group", () => {
		const sessions = map(
			makeSession({ ...liveServer, id: "1", serverGroup: "web" }),
		);
		expect(liveServerRun(sessions, slot("web"))?.id).toBe("1");
	});

	it("ignores a live server in a different group", () => {
		const sessions = map(
			makeSession({ ...liveServer, id: "1", serverGroup: "api" }),
		);
		expect(liveServerRun(sessions, slot("web"))).toBeUndefined();
	});

	it("lets api and web servers hold their own slots for one origin", () => {
		const sessions = map(
			makeSession({ ...liveServer, id: "1", serverGroup: "api" }),
			makeSession({ ...liveServer, id: "2", serverGroup: "web" }),
		);
		expect(liveServerRun(sessions, slot("api"))?.id).toBe("1");
		expect(liveServerRun(sessions, slot("web"))?.id).toBe("2");
	});

	it("keeps a group singleton across sibling clones of the same remote", () => {
		const sessions = map(
			makeSession({ ...liveServer, id: "1", cwd: "/clone-a" }),
		);
		expect(liveServerRun(sessions, slot("default"))?.id).toBe("1");
	});

	it("matches a live server on the same port in another repo and group", () => {
		const sessions = map(makeSession({ ...liveServer, serverPort: 5173 }));
		expect(liveServerRun(sessions, slot("coach", "gh/o/other", 5173))?.id).toBe(
			"1",
		);
	});

	it("matches a port holder when the new run has no origin", () => {
		const sessions = map(makeSession({ ...liveServer, serverPort: 5173 }));
		expect(
			liveServerRun(sessions, { server: true, group: "default", port: 5173 })
				?.id,
		).toBe("1");
	});

	it("lets servers on different ports in different repos run side by side", () => {
		const sessions = map(makeSession({ ...liveServer, serverPort: 5173 }));
		expect(
			liveServerRun(sessions, slot("default", "gh/o/other", 3000)),
		).toBeUndefined();
	});

	it("ignores a finished server that held the port", () => {
		const sessions = map(
			makeSession({ ...liveServer, status: "done", serverPort: 5173 }),
		);
		expect(
			liveServerRun(sessions, slot("coach", "gh/o/other", 5173)),
		).toBeUndefined();
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
