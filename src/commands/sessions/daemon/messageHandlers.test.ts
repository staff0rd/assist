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
	} as unknown as SessionManager & {
		windowsProxy: { route: ReturnType<typeof vi.fn> };
		setStatus: ReturnType<typeof vi.fn>;
	};
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
