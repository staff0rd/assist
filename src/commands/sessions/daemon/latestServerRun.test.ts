import { describe, expect, it } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { latestServerRun } from "./latestServerRun";

function server(
	id: string,
	status: Session["status"],
	startedAt: number,
	group = "default",
): Session {
	return makeSession({
		id,
		status,
		startedAt,
		commandType: "run",
		server: true,
		serverOrigin: "gh/o/r",
		serverGroup: group,
	});
}

function map(...sessions: Session[]): Map<string, Session> {
	return new Map(sessions.map((s) => [s.id, s]));
}

describe("latestServerRun", () => {
	it("prefers a live run over a newer exited one", () => {
		const sessions = map(server("1", "running", 1), server("2", "error", 2));
		expect(latestServerRun(sessions, "gh/o/r", "default")?.id).toBe("1");
	});

	it("falls back to the most recently started exited run", () => {
		const sessions = map(
			server("1", "done", 1),
			server("2", "error", 3),
			server("3", "done", 2),
		);
		expect(latestServerRun(sessions, "gh/o/r", "default")?.id).toBe("2");
	});

	it("ignores other groups, origins and non-server sessions", () => {
		const sessions = map(
			server("1", "done", 1, "web"),
			makeSession({ id: "2", status: "done", serverOrigin: "gh/o/r" }),
		);
		expect(latestServerRun(sessions, "gh/o/r", "default")).toBeUndefined();
	});
});
