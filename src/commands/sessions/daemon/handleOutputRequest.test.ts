import { describe, expect, it, vi } from "vitest";
import { messageHandlers } from "./messageHandlers";
import type { SessionManager } from "./SessionManager";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function fakeManager(scrollbacks: Record<string, string>) {
	const sessions = new Map(
		Object.entries(scrollbacks).map(([id, scrollback]) => [
			id,
			{ id, scrollback },
		]),
	);
	return {
		update: (mutate: (s: typeof sessions) => boolean) => mutate(sessions),
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
});
