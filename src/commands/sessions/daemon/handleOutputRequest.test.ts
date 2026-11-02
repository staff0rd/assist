import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { messageHandlers } from "./messageHandlers";
import type { SessionManager } from "./SessionManager";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function fakeManager(...sessions: Session[]) {
	const map = new Map(sessions.map((s) => [s.id, s]));
	return {
		update: (mutate: (s: typeof map) => boolean) => mutate(map),
	} as unknown as SessionManager;
}

function serverRun(
	id: string,
	group: string,
	status: Session["status"],
	scrollback: string,
): Session {
	return makeSession({
		id,
		status,
		scrollback,
		commandType: "run",
		server: true,
		serverOrigin: "gh/o/r",
		serverGroup: group,
	});
}

function sentMessages(client: { send: ReturnType<typeof vi.fn> }) {
	return client.send.mock.calls.map(([raw]) => JSON.parse(raw as string));
}

describe("output handler", () => {
	it("replies on the requesting connection with the session's scrollback", () => {
		const client = { send: vi.fn() };

		messageHandlers.output(
			client as never,
			fakeManager(makeSession({ id: "7", scrollback: "hello\n" })),
			{ sessionId: "7" },
		);

		expect(sentMessages(client)).toEqual([
			{ type: "session-output", sessionId: "7", scrollback: "hello\n" },
		]);
	});

	it("replies with an empty scrollback for a session with no output yet", () => {
		const client = { send: vi.fn() };

		messageHandlers.output(
			client as never,
			fakeManager(makeSession({ id: "7" })),
			{ sessionId: "7" },
		);

		expect(sentMessages(client)[0].scrollback).toBe("");
	});

	it("replies with an error for an unknown session id", () => {
		const client = { send: vi.fn() };

		messageHandlers.output(client as never, fakeManager(), {
			sessionId: "99",
		});

		expect(sentMessages(client)).toEqual([
			{
				type: "session-output",
				sessionId: "99",
				error: "No session 99 on this node",
			},
		]);
	});

	it("replies with the live server run's scrollback for a server target", () => {
		const client = { send: vi.fn() };
		const manager = fakeManager(
			serverRun("3", "default", "running", "api\n"),
			serverRun("4", "web", "running", "web\n"),
		);

		messageHandlers.output(client as never, manager, {
			server: { origin: "gh/o/r", group: "web" },
		});

		expect(sentMessages(client)).toEqual([
			{ type: "session-output", sessionId: "4", scrollback: "web\n" },
		]);
	});

	it("flags an exited server run's scrollback as not live", () => {
		const client = { send: vi.fn() };

		messageHandlers.output(
			client as never,
			fakeManager(serverRun("3", "default", "error", "crash\n")),
			{ server: { origin: "gh/o/r", group: "default" } },
		);

		expect(sentMessages(client)).toEqual([
			{
				type: "session-output",
				sessionId: "3",
				scrollback: "crash\n",
				exited: "error",
			},
		]);
	});

	it("replies with an error when no server run exists for the remote and group", () => {
		const client = { send: vi.fn() };

		messageHandlers.output(client as never, fakeManager(), {
			server: { origin: "gh/o/r", group: "default" },
		});

		expect(sentMessages(client)).toEqual([
			{
				type: "session-output",
				error: "No live server run for gh/o/r (default)",
			},
		]);
	});
});
