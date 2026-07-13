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
		expect(m.setStatus).toHaveBeenCalledWith("42", "waiting");
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

		expect(m.spawn).toHaveBeenCalledWith("make it pop", "/repo", true);
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

		expect(m.spawn).toHaveBeenCalledWith("hello", "/repo", false);
		expect(daemonLogMock).not.toHaveBeenCalled();
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
