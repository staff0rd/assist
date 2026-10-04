import { describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session, SessionStatus } from "./createSession";
import { respawnSession } from "./respawnSession";
import { MissingCwdError } from "./spawnPty";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function respawnWith(session: Session, respawn: () => Session["pty"]) {
	const sent: string[] = [];
	const clients = new Set([{ send: (data: string) => sent.push(data) }]);
	respawnSession(session, respawn, "waiting", clients, (s, status) => {
		s.status = status;
	});
	return sent.map((data) => JSON.parse(data) as { type: string });
}

describe("respawnSession", () => {
	it("surfaces a refused spawn on the card rather than throwing out of the restart", () => {
		const session = makeSession({
			id: "9",
			name: "vanished tree session",
			status: "waiting",
			pty: null,
			scrollback: "old output",
			cwd: "/git/repo-2",
		});

		const messages = respawnWith(session, () => {
			throw new MissingCwdError("/git/repo-2");
		});

		expect(session.status).toBe("error");
		expect(session.pty).toBeNull();
		expect(session.error).toBe(
			"working directory no longer exists: /git/repo-2",
		);
		expect(session.scrollback).toContain("/git/repo-2");
		expect(messages.map((m) => m.type)).toEqual(["clear", "output"]);
	});

	it("leaves a successful respawn untouched", () => {
		const session = makeSession({
			id: "9",
			name: "vanished tree session",
			status: "waiting",
			pty: null,
			scrollback: "old output",
			cwd: "/git/repo-2",
		});
		const { pty } = makePty();

		respawnWith(session, () => pty);

		expect(session.status).toBe<SessionStatus>("waiting");
		expect(session.error).toBeUndefined();
		expect(session.pty).toBe(pty);
	});

	it("clears the scrollback on respawn", () => {
		const session = makeSession({ scrollback: "old output", pty: null });
		const { pty } = makePty();

		const messages = respawnWith(session, () => pty);

		expect(session.scrollback).toBe("");
		expect(messages.map((m) => m.type)).toEqual(["clear"]);
	});
});
