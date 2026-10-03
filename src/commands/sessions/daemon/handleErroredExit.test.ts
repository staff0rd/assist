import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./exitReason", () => ({
	exitDetail: vi.fn(() => undefined),
	exitReason: vi.fn((code: number) => `process exited with code ${code}`),
}));

import { makeSession } from "../../../test/mothers/makeSession";
import { daemonLog } from "./daemonLog";
import { handleErroredExit } from "./handleErroredExit";

const mockDaemonLog = daemonLog as unknown as MockInstance;

describe("handleErroredExit", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("logs the failed process's output so the cause is visible in daemon.log", () => {
		handleErroredExit(
			makeSession({
				scrollback: "error: unknown option '--resume-session'\r\n",
			}),
			1,
			"running",
			vi.fn(),
		);

		expect(mockDaemonLog).toHaveBeenCalledWith(
			expect.stringContaining(
				"output: error: unknown option '--resume-session'",
			),
		);
	});

	it("marks the session errored", () => {
		const onStatusChange = vi.fn();
		const session = makeSession();

		handleErroredExit(session, 1, "running", onStatusChange);

		expect(session.error).toBe("process exited with code 1");
		expect(onStatusChange).toHaveBeenCalledWith(session, "error", 1);
	});
});
