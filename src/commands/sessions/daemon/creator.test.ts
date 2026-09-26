import { describe, expect, it, vi } from "vitest";
import type { SessionClient } from "./broadcast";
import { creator } from "./creator";
import type { SessionManager } from "./SessionManager";

function harness(routes = false) {
	const send = vi.fn();
	const client: SessionClient = { send };
	const manager = {
		links: { route: vi.fn(() => routes) },
	} as unknown as SessionManager;
	const sent = () => send.mock.calls.map(([json]) => JSON.parse(json));
	return { client, manager, sent };
}

describe("creator", () => {
	it("replies with the created session id", () => {
		const { client, manager, sent } = harness();

		creator(true, () => "7")(client, manager, {});

		expect(sent()).toEqual([{ type: "created", sessionId: "7", isNew: true }]);
	});

	it("replies with an error when the spawn is refused", () => {
		const { client, manager, sent } = harness();

		creator(true, () => ({ error: "Can't add an agent: no such session." }))(
			client,
			manager,
			{},
		);

		expect(sent()).toEqual([
			{ type: "error", message: "Can't add an agent: no such session." },
		]);
	});

	it("sends nothing when the message is routed to the windows daemon", () => {
		const { client, manager, sent } = harness(true);
		const spawn = vi.fn(() => "7");

		creator(true, spawn)(client, manager, {});

		expect(spawn).not.toHaveBeenCalled();
		expect(sent()).toEqual([]);
	});
});
