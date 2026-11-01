import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makePty } from "../../../../test/mothers/makePty";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { SessionClient } from "../broadcast";
import { daemonLog } from "../daemonLog";
import { dispatchMessage } from "../dispatchMessage";
import type { InProcessPeer } from "../links/inProcessClient";
import { inProcessTransport } from "../links/inProcessTransport";
import type { LinkSpec } from "../links/LinkStatus";
import { SessionManager } from "../SessionManager";

const helloName = vi.hoisted(() => ({ current: "pc-wsl" }));
const showNotification = vi.hoisted(() => vi.fn(() => true));

vi.mock("../../shared/resolveNodeName", () => ({
	resolveNodeName: () => helloName.current,
}));
vi.mock("../../../notify/showNotification", () => ({ showNotification }));
vi.mock("../loadPersistedSessions", () => ({
	loadPersistedSessions: vi.fn(() => []),
	persistLiveSessions: vi.fn(),
}));
vi.mock("../loadActiveSelection", () => ({
	loadActiveSelection: vi.fn(() => ({})),
	saveActiveSelection: vi.fn(),
}));
vi.mock("../../shared/discoverSessions", () => ({
	discoverSessions: async () => [],
}));
vi.mock("../daemonLog", () => ({
	daemonLog: vi.fn(),
	relayDaemonLog: vi.fn(),
	recentDaemonLogLines: () => [],
}));

type Msg = Record<string, unknown>;

const PIN = "042";

function cli() {
	const received: Msg[] = [];
	const client: SessionClient = { send: (d) => received.push(JSON.parse(d)) };
	const reply = (type: string) => received.find((m) => m.type === type);
	return { client, received, reply };
}

const peers = new Map<string, InProcessPeer>();
const bridge = inProcessTransport(peers, (name) => {
	helloName.current = name;
});

function node(name: string, links: LinkSpec[] = []) {
	const manager = new SessionManager();
	manager.links.configure({
		specs: () => links,
		localNode: () => name,
		transport: bridge.transport,
		reconnectMs: 5,
		blockedRetryMs: 20,
		createTimeoutMs: 200,
	});
	peers.set(`http://${name}`, { name, manager });
	return manager;
}

const WINDOWS = { name: "pc-windows", url: "http://pc-windows" };

async function linkedPair(viewerNode?: string) {
	const wsl = node("pc-wsl", [WINDOWS]);
	const windows = node("pc-windows");
	windows.update((sessions) => {
		sessions.set(
			"3",
			makeSession({
				id: "3",
				name: "s3",
				status: "running",
				pty: makePty().pty,
				activeViewer: viewerNode ? "tab-1" : undefined,
				activeViewerNode: viewerNode,
			}),
		);
		return true;
	});
	helloName.current = "pc-wsl";
	wsl.links.reload();
	await vi.waitFor(() =>
		expect(wsl.links.nodes().links[0].state).toBe("connected"),
	);
	return { wsl, windows };
}

function notifyPin(manager: SessionManager, requestId = "n1") {
	const session = cli();
	dispatchMessage(session.client, manager, {
		type: "notify-pin",
		sessionId: "3",
		requestId,
		area: "docs",
		pin: PIN,
		title: "assist docs unlock: a1 Story (phase 1)",
		message: `Pin ${PIN} — run: assist docs confirm ${PIN}`,
	});
	return session;
}

function loggedLines(): string[] {
	return vi.mocked(daemonLog).mock.calls.map((c) => String(c[0]));
}

beforeEach(() => {
	showNotification.mockReturnValue(true);
});

afterEach(() => {
	for (const peer of peers.values()) peer.manager.links.dispose();
	peers.clear();
	vi.clearAllMocks();
});

describe("PIN relay between linked nodes", () => {
	it("shows the PIN on the viewer's node", async () => {
		const { windows } = await linkedPair("pc-wsl");

		const session = notifyPin(windows);
		await vi.waitFor(() =>
			expect(session.reply("notify-pin-result")).toEqual({
				type: "notify-pin-result",
				requestId: "n1",
				node: "pc-wsl",
			}),
		);
		expect(showNotification).toHaveBeenCalledOnce();
		expect(showNotification).toHaveBeenCalledWith({
			title: expect.stringContaining("assist docs unlock"),
			message: expect.stringContaining(PIN),
		});
		expect(loggedLines().some((line) => line.includes(PIN))).toBe(false);
	});

	it("notifies locally when the session has no active viewer", async () => {
		const { windows } = await linkedPair();

		const session = notifyPin(windows);

		expect(session.reply("notify-pin-result")).toEqual({
			type: "notify-pin-result",
			requestId: "n1",
		});
		expect(showNotification).not.toHaveBeenCalled();
	});

	it("notifies locally when the session is controlled from its own node", async () => {
		const { windows } = await linkedPair("pc-windows");

		const session = notifyPin(windows);

		expect(session.reply("notify-pin-result")).not.toHaveProperty("node");
		expect(showNotification).not.toHaveBeenCalled();
	});

	it("falls back to local when the viewer's node cannot show the PIN", async () => {
		const { windows } = await linkedPair("pc-wsl");
		showNotification.mockReturnValue(false);

		const session = notifyPin(windows);

		await vi.waitFor(() =>
			expect(session.reply("notify-pin-result")).toEqual({
				type: "notify-pin-result",
				requestId: "n1",
			}),
		);
	});
});
