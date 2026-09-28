import { describe, expect, it, vi } from "vitest";
import { messageHandlers } from "./messageHandlers";
import type { SessionManager } from "./SessionManager";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function fakeManager(
	scrollbacks: Record<string, string>,
	servers: Record<string, string> = {},
) {
	const sessions = new Map(
		Object.entries(scrollbacks).map(([id, scrollback]) => [
			id,
			{ id, scrollback },
		]),
	);
	return {
		update: (mutate: (s: typeof sessions) => boolean) => mutate(sessions),
		liveServerRun: (origin: string, group: string) => {
			const id = servers[`${origin} ${group}`];
			return id ? { id } : undefined;
		},
	} as unknown as SessionManager;
}

function sentMessages(client: { send: ReturnType<typeof vi.fn> }) {
	return client.send.mock.calls.map(([raw]) => JSON.parse(raw as string));
}

describe("output handler", () => {
	it("replies on the requesting connection with the session's scrollback", () => {
		const client = { send: vi.fn() };

		messageHandlers.output(client as never, fakeManager({ "7": "hello\n" }), {
			sessionId: "7",
		});

		expect(sentMessages(client)).toEqual([
			{ type: "session-output", sessionId: "7", scrollback: "hello\n" },
		]);
	});

	it("replies with an empty scrollback for a session with no output yet", () => {
		const client = { send: vi.fn() };

		messageHandlers.output(client as never, fakeManager({ "7": "" }), {
			sessionId: "7",
		});

		expect(sentMessages(client)[0].scrollback).toBe("");
	});

	it("replies with an error for an unknown session id", () => {
		const client = { send: vi.fn() };

		messageHandlers.output(client as never, fakeManager({}), {
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
			{ "3": "api\n", "4": "web\n" },
			{ "gh/o/r default": "3", "gh/o/r web": "4" },
		);

		messageHandlers.output(client as never, manager, {
			server: { origin: "gh/o/r", group: "web" },
		});

		expect(sentMessages(client)).toEqual([
			{ type: "session-output", sessionId: "4", scrollback: "web\n" },
		]);
	});

	it("replies with an error when no server is live for the remote and group", () => {
		const client = { send: vi.fn() };

		messageHandlers.output(client as never, fakeManager({}), {
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
