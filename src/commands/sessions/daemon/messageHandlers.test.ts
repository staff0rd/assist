import { beforeEach, describe, expect, it, vi } from "vitest";
import { daemonLog } from "./daemonLog";
import { messageHandlers } from "./messageHandlers";
import type { SessionManager } from "./SessionManager";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const daemonLogMock = daemonLog as unknown as ReturnType<typeof vi.fn>;

function fakeManager(routeReturns = false) {
	return {
		windowsProxy: { route: vi.fn(() => routeReturns) },
		setStatus: vi.fn(),
		spawn: vi.fn(() => "5"),
	} as unknown as SessionManager & {
		windowsProxy: { route: ReturnType<typeof vi.fn> };
		setStatus: ReturnType<typeof vi.fn>;
		spawn: ReturnType<typeof vi.fn>;
	};
}

function fakeClient() {
	return { send: vi.fn() };
}

describe("set-status handler", () => {
	beforeEach(() => daemonLogMock.mockClear());

	it("logs the inbound request on arrival, before any session lookup", () => {
		const m = fakeManager();

		messageHandlers["set-status"]({} as never, m, {
			sessionId: "42",
			status: "waiting",
		});

		expect(daemonLogMock).toHaveBeenCalledWith(
			"set-status received: id=42 status=waiting",
		);
		expect(m.setStatus).toHaveBeenCalledWith({
			id: "42",
			status: "waiting",
			source: undefined,
			claudeSessionId: undefined,
		});
	});

	it("still logs receipt when the request is routed to the windows daemon", () => {
		const m = fakeManager(true);

		messageHandlers["set-status"]({} as never, m, {
			sessionId: "win-3",
			status: "running",
		});

		expect(daemonLogMock).toHaveBeenCalledWith(
			"set-status received: id=win-3 status=running",
		);
		expect(m.setStatus).not.toHaveBeenCalled();
	});

	it("passes the hook source through to the manager", () => {
		const m = fakeManager();

		messageHandlers["set-status"](fakeClient() as never, m, {
			sessionId: "42",
			status: "waiting",
			source: "permission",
		});

		expect(m.setStatus).toHaveBeenCalledWith({
			id: "42",
			status: "waiting",
			source: "permission",
			claudeSessionId: undefined,
		});
	});

	it("passes the conversation the hook fired for through to the manager", () => {
		const m = fakeManager();

		messageHandlers["set-status"](fakeClient() as never, m, {
			sessionId: "42",
			status: "running",
			source: "prompt",
			claudeSessionId: "after-clear",
		});

		expect(m.setStatus).toHaveBeenCalledWith({
			id: "42",
			status: "running",
			source: "prompt",
			claudeSessionId: "after-clear",
		});
	});

	it("acknowledges an ack'd delivery back to the client", () => {
		const m = fakeManager();
		const client = fakeClient();

		messageHandlers["set-status"](client as never, m, {
			sessionId: "42",
			status: "waiting",
			source: "stop",
			ack: true,
		});

		expect(client.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "ack", sessionId: "42" }),
		);
	});

	it("does not acknowledge a best-effort delivery", () => {
		const m = fakeManager();
		const client = fakeClient();

		messageHandlers["set-status"](client as never, m, {
			sessionId: "42",
			status: "running",
			source: "pretool",
		});

		expect(client.send).not.toHaveBeenCalled();
	});
});

describe("create handler", () => {
	beforeEach(() => daemonLogMock.mockClear());

	it("spawns a design session and logs it when design is set", () => {
		const m = fakeManager();
		const client = fakeClient();

		messageHandlers.create(client as never, m, {
			prompt: "make it pop",
			cwd: "/repo",
			design: true,
		});

		expect(m.spawn).toHaveBeenCalledWith(
			expect.objectContaining({
				prompt: "make it pop",
				cwd: "/repo",
				design: true,
			}),
			{ launchedFrom: undefined },
		);
		expect(daemonLogMock).toHaveBeenCalledWith(
			"create: design session (cwd=/repo)",
		);
		expect(client.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "created", sessionId: "5", isNew: true }),
		);
	});

	it("spawns a plain session without the design flag or a log line", () => {
		const m = fakeManager();
		const client = fakeClient();

		messageHandlers.create(client as never, m, {
			prompt: "hello",
			cwd: "/repo",
		});

		expect(m.spawn).toHaveBeenCalledWith(
			expect.objectContaining({ prompt: "hello", cwd: "/repo", design: false }),
			{ launchedFrom: undefined },
		);
		expect(daemonLogMock).not.toHaveBeenCalled();
	});

	it("forwards the harness and logs it for a pi session", () => {
		const m = fakeManager();
		const client = fakeClient();

		messageHandlers.create(client as never, m, {
			prompt: "hello",
			cwd: "/repo",
			harness: "pi",
		});

		expect(m.spawn).toHaveBeenCalledWith(
			expect.objectContaining({ harness: "pi" }),
			{ launchedFrom: undefined },
		);
		expect(daemonLogMock).toHaveBeenCalledWith(
			"create: pi session (cwd=/repo)",
		);
	});
});

describe("create-assist handler", () => {
	function assistManager() {
		return {
			windowsProxy: { route: vi.fn(() => false) },
			spawnAssist: vi.fn(() => "9"),
		} as unknown as SessionManager & { spawnAssist: ReturnType<typeof vi.fn> };
	}

	it("forwards the launching card so the review nests under it", () => {
		const m = assistManager();

		messageHandlers["create-assist"](fakeClient() as never, m, {
			assistArgs: ["review", "42"],
			cwd: "/git/repo",
			title: "PR #42",
			inPlace: true,
			launchedFrom: "7",
		});

		expect(m.spawnAssist).toHaveBeenCalledWith(
			["review", "42"],
			"/git/repo",
			{ title: "PR #42", subtitle: undefined, inPlace: true },
			{ launchedFrom: "7" },
		);
	});

	it("leaves the launcher unset when the payload carries none", () => {
		const m = assistManager();

		messageHandlers["create-assist"](fakeClient() as never, m, {
			assistArgs: ["review", "42"],
			cwd: "/git/repo",
		});

		expect(m.spawnAssist).toHaveBeenCalledWith(
			["review", "42"],
			"/git/repo",
			expect.anything(),
			{ launchedFrom: undefined },
		);
	});
});

describe("restart handler", () => {
	function restartManager(result: { ok: boolean; reason?: string }) {
		return {
			windowsProxy: { route: vi.fn(() => false) },
			restart: vi.fn(() => result),
		} as unknown as SessionManager & { restart: ReturnType<typeof vi.fn> };
	}

	it("sends an error toast when restart cannot proceed", () => {
		const m = restartManager({
			ok: false,
			reason: "Session s can't be restarted.",
		});
		const client = fakeClient();

		messageHandlers.restart(client as never, m, { sessionId: "1" });

		expect(m.restart).toHaveBeenCalledWith("1");
		expect(client.send).toHaveBeenCalledWith(
			JSON.stringify({
				type: "error",
				message: "Session s can't be restarted.",
			}),
		);
	});

	it("stays silent when restart succeeds", () => {
		const m = restartManager({ ok: true });
		const client = fakeClient();

		messageHandlers.restart(client as never, m, { sessionId: "1" });

		expect(client.send).not.toHaveBeenCalled();
	});
});

describe("pr-decision handler", () => {
	function prManager(routeReturns: boolean) {
		return {
			windowsProxy: { route: vi.fn(() => routeReturns) },
			prPreview: { decide: vi.fn() },
		} as unknown as SessionManager & {
			windowsProxy: { route: ReturnType<typeof vi.fn> };
			prPreview: { decide: ReturnType<typeof vi.fn> };
		};
	}

	it("decides locally when the message is not routed away", () => {
		const m = prManager(false);
		const d = { sessionId: "42", requestId: "r1", decision: "approve" };

		messageHandlers["pr-decision"](fakeClient() as never, m, d);

		expect(m.prPreview.decide).toHaveBeenCalledWith(d);
	});

	it("hands a windows-proxied decision to the windows daemon instead", () => {
		const m = prManager(true);
		const d = {
			sessionId: "w-1",
			requestId: "r1",
			decision: "reject",
			reason: "nope",
			comments: ["fix this"],
			screenshots: ["shot.png"],
			reviewAfter: true,
			announceAfter: true,
		};

		messageHandlers["pr-decision"](fakeClient() as never, m, d);

		expect(m.windowsProxy.route).toHaveBeenCalledWith(expect.anything(), d);
		expect(m.prPreview.decide).not.toHaveBeenCalled();
	});
});

describe("ui-status handler", () => {
	beforeEach(() => daemonLogMock.mockClear());

	it("logs what the web UI rendered so daemon.log alone traces the UI stage", () => {
		messageHandlers["ui-status"]({} as never, fakeManager(), {
			sessionId: "42",
			status: "running",
		});

		expect(daemonLogMock).toHaveBeenCalledWith(
			"ui rendered: id=42 status=running",
		);
	});
});

describe("verify-started handler", () => {
	function verifyManager(routeReturns: boolean) {
		return {
			windowsProxy: { route: vi.fn(() => routeReturns) },
			verify: { start: vi.fn() },
		} as unknown as SessionManager & {
			windowsProxy: { route: ReturnType<typeof vi.fn> };
			verify: { start: ReturnType<typeof vi.fn> };
		};
	}

	it("flags the local session when the message is not routed away", () => {
		const m = verifyManager(false);
		const client = fakeClient();

		messageHandlers["verify-started"](client as never, m, { sessionId: "42" });

		expect(m.verify.start).toHaveBeenCalledWith(client, "42");
	});

	it("hands a windows-origin session to the windows daemon instead", () => {
		const m = verifyManager(true);

		messageHandlers["verify-started"](fakeClient() as never, m, {
			sessionId: "win-3",
		});

		expect(m.windowsProxy.route).toHaveBeenCalled();
		expect(m.verify.start).not.toHaveBeenCalled();
	});
});

describe("rename handler", () => {
	function renameManager(routeReturns = false) {
		return {
			windowsProxy: { route: vi.fn(() => routeReturns) },
			setTitle: vi.fn(),
		} as unknown as SessionManager & {
			windowsProxy: { route: ReturnType<typeof vi.fn> };
			setTitle: ReturnType<typeof vi.fn>;
		};
	}

	it("retitles the local session", () => {
		const m = renameManager();

		messageHandlers.rename(fakeClient() as never, m, {
			sessionId: "42",
			title: "fix login redirect",
		});

		expect(m.setTitle).toHaveBeenCalledWith("42", "fix login redirect");
	});

	it("passes a missing title through as blank for the manager to ignore", () => {
		const m = renameManager();

		messageHandlers.rename(fakeClient() as never, m, { sessionId: "42" });

		expect(m.setTitle).toHaveBeenCalledWith("42", "");
	});

	it("hands a windows-origin session to the windows daemon instead", () => {
		const m = renameManager(true);

		messageHandlers.rename(fakeClient() as never, m, {
			sessionId: "win-3",
			title: "fix login redirect",
		});

		expect(m.windowsProxy.route).toHaveBeenCalled();
		expect(m.setTitle).not.toHaveBeenCalled();
	});
});
