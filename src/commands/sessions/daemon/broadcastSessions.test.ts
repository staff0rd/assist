import { expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { broadcastSessions } from "./broadcastSessions";
import { ClientHub } from "./ClientHub";

vi.mock("./loadPersistedSessions", () => ({ persistLiveSessions: vi.fn() }));

it("retains local activity after the running session waits or is removed", () => {
	const session = makeSession({ status: "waiting" });
	const sessions = new Map([[session.id, session]]);
	const clients = new ClientHub();
	const send = vi.fn();
	clients.add({ send });
	const activity = () => {
		broadcastSessions(sessions, clients);
		return JSON.parse(send.mock.lastCall?.[0] ?? "{}").restartActivity;
	};
	const idle = activity();
	session.status = "running";
	const busy = activity();
	expect(busy).not.toBe(idle);
	session.status = "waiting";
	expect(activity()).toBe(busy);
	sessions.clear();
	expect(activity()).toBe(busy);
});

it("ignores server runs, review waits and linked sessions", () => {
	const session = makeSession({ status: "running", commandType: "run" });
	const sessions = new Map([[session.id, session]]);
	const clients = new ClientHub();
	const send = vi.fn();
	clients.add({ send });
	const activity = () => {
		broadcastSessions(sessions, clients, [{ ...session, node: "remote" }]);
		return JSON.parse(send.mock.lastCall?.[0] ?? "{}").restartActivity;
	};
	const idle = activity();
	expect(activity()).toBe(idle);
	session.commandType = "assist";
	session.pendingPrPreview = {
		requestId: "review",
		title: "Review",
		body: "",
		prNumber: null,
		kind: "ask",
	};
	expect(activity()).toBe(idle);
});
