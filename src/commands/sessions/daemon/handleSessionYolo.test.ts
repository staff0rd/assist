import { beforeEach, describe, expect, it, vi } from "vitest";

const yoloEnabled = vi.fn();
const daemonLog = vi.fn();

vi.mock("./yoloEnabled", () => ({
	yoloEnabled: (cwd: string | undefined) => yoloEnabled(cwd),
}));
vi.mock("./daemonLog", () => ({
	daemonLog: (line: string) => daemonLog(line),
}));

import { handleSessionYolo } from "./handleSessionYolo";
import type { SessionManager } from "./SessionManager";

function handle(session: { yolo?: boolean; cwd: string } | undefined) {
	const client = { send: vi.fn() };
	const manager = { session: vi.fn(() => session) };
	handleSessionYolo(client, manager as unknown as SessionManager, {
		sessionId: "7",
	});
	return JSON.parse(client.send.mock.calls[0][0] as string) as {
		type: string;
		yolo: boolean;
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	yoloEnabled.mockReturnValue(false);
});

describe("handleSessionYolo", () => {
	it("reports a session started yolo", () => {
		expect(handle({ yolo: true, cwd: "/r" })).toEqual({
			type: "session-yolo",
			yolo: true,
		});
		expect(daemonLog).toHaveBeenCalledWith(
			"session-yolo: session 7 lookup: yolo (session flag)",
		);
	});

	it("reports a session whose repo sets sessions.yolo", () => {
		yoloEnabled.mockReturnValue(true);
		expect(handle({ cwd: "/r" }).yolo).toBe(true);
		expect(yoloEnabled).toHaveBeenCalledWith("/r");
		expect(daemonLog).toHaveBeenCalledWith(
			"session-yolo: session 7 lookup: yolo (sessions.yolo config)",
		);
	});

	it("reports a session with neither as not yolo", () => {
		expect(handle({ cwd: "/r" }).yolo).toBe(false);
		expect(daemonLog).toHaveBeenCalledWith(
			"session-yolo: session 7 lookup: not yolo",
		);
	});

	it("reports an unknown session as not yolo", () => {
		expect(handle(undefined).yolo).toBe(false);
		expect(daemonLog).toHaveBeenCalledWith(
			"session-yolo: session 7 lookup: unknown session",
		);
	});
});
