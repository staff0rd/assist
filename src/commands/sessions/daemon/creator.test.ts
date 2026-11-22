import { describe, expect, it, vi } from "vitest";
import type { SessionClient } from "./broadcast";
import { creator } from "./creator";
import type { SessionManager } from "./SessionManager";

type Msg = Record<string, unknown>;

function harness(routes = false, sessions: Record<string, object> = {}) {
	const send = vi.fn();
	const client: SessionClient = { send };
	const manager = {
		links: { route: vi.fn(() => routes) },
		session: (id: string) => sessions[id],
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

	it("replies once an async spawn resolves", async () => {
		const { client, manager, sent } = harness();

		creator(true, async () => "8")(client, manager, {});
		expect(sent()).toEqual([]);
		await Promise.resolve();
		await Promise.resolve();

		expect(sent()).toEqual([{ type: "created", sessionId: "8", isNew: true }]);
	});

	it("sends nothing when the message is routed to the windows daemon", () => {
		const { client, manager, sent } = harness(true);
		const spawn = vi.fn((_m: SessionManager, _d: Msg) => "7");

		creator(true, spawn)(client, manager, {});

		expect(spawn).not.toHaveBeenCalled();
		expect(sent()).toEqual([]);
	});
});

describe("creator yolo inheritance", () => {
	const request = () => ({
		type: "create-assist",
		assistArgs: ["backlog", "run", "a1"],
		yoloFrom: "3",
	});

	it("starts a run requested by a yolo draft as yolo", () => {
		const { client, manager } = harness(false, { "3": { yolo: true } });
		const spawn = vi.fn((_m: SessionManager, _d: Msg) => "7");

		creator(true, spawn)(client, manager, request());

		expect(spawn).toHaveBeenCalledWith(
			manager,
			expect.objectContaining({ yolo: true }),
		);
		expect(spawn.mock.calls[0]?.[1]).not.toHaveProperty("yoloFrom");
	});

	it("starts a run requested by a non-yolo draft without yolo", () => {
		const { client, manager } = harness(false, { "3": {} });
		const spawn = vi.fn((_m: SessionManager, _d: Msg) => "7");

		creator(true, spawn)(client, manager, request());

		expect(spawn.mock.calls[0]?.[1]).not.toHaveProperty("yolo");
	});

	it("stamps yolo before forwarding a run to another node", () => {
		const { client, manager } = harness(true, { "3": { yolo: true } });
		const d: Record<string, unknown> = request();

		creator(true, vi.fn())(client, manager, d);

		expect(d).toMatchObject({ yolo: true });
		expect(d).not.toHaveProperty("yoloFrom");
	});
});
