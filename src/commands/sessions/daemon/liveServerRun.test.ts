import { describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { liveServerRun, stopServerSession } from "./liveServerRun";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function session(over: Partial<Session>): Session {
	return {
		id: "1",
		name: "run: dev",
		commandType: "run",
		status: "running",
		server: true,
		serverOrigin: "gh/o/r",
		...over,
	} as unknown as Session;
}

function map(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((s) => [s.id, s]));
}

describe("liveServerRun", () => {
	it("returns a live server run matching the origin", () => {
		expect(liveServerRun(map(session({})), "gh/o/r")?.id).toBe("1");
	});

	it("ignores done/error servers so the slot frees on exit", () => {
		const sessions = map(
			session({ status: "done" }),
			session({ id: "2", status: "error" }),
		);
		expect(liveServerRun(sessions, "gh/o/r")).toBeUndefined();
	});

	it("ignores non-server runs and other origins", () => {
		const sessions = map(
			session({ server: undefined }),
			session({ id: "2", serverOrigin: "gh/o/other" }),
		);
		expect(liveServerRun(sessions, "gh/o/r")).toBeUndefined();
	});

	it("excludes the given session id", () => {
		expect(liveServerRun(map(session({})), "gh/o/r", "1")).toBeUndefined();
	});
});

describe("stopServerSession", () => {
	it("flags stopping and kills a live pty", () => {
		const kill = vi.fn();
		const s = session({ pty: { kill } as unknown as Session["pty"] });
		stopServerSession(map(s), "1");
		expect(s.stopping).toBe(true);
		expect(kill).toHaveBeenCalledOnce();
	});

	it("does nothing for an already-finished session", () => {
		const kill = vi.fn();
		const s = session({
			status: "done",
			pty: { kill } as unknown as Session["pty"],
		});
		stopServerSession(map(s), "1");
		expect(kill).not.toHaveBeenCalled();
	});
});
