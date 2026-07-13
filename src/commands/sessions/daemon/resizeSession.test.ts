import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { resizeSession } from "./writeToSession";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const daemonLogMock = daemonLog as unknown as ReturnType<typeof vi.fn>;

function makeSession(overrides: Partial<Session>): Session {
	return {
		id: "1",
		name: "repo/session",
		commandType: "claude",
		status: "waiting",
		startedAt: 1,
		runningMs: 0,
		runningSince: null,
		pty: null,
		scrollback: "",
		...overrides,
	};
}

describe("resizeSession", () => {
	beforeEach(() => vi.clearAllMocks());

	it("resizes a live pty", () => {
		const resize = vi.fn();
		const sessions = new Map<string, Session>([
			["1", makeSession({ pty: { resize } as unknown as Session["pty"] })],
		]);

		resizeSession(sessions, "1", 120, 40);

		expect(resize).toHaveBeenCalledWith(120, 40);
	});

	it("does not throw and logs when the pty is dead (ENOTTY)", () => {
		const resize = vi.fn(() => {
			throw new Error("ioctl(2) failed, ENOTTY");
		});
		const sessions = new Map<string, Session>([
			["1", makeSession({ pty: { resize } as unknown as Session["pty"] })],
		]);

		expect(() => resizeSession(sessions, "1", 120, 40)).not.toThrow();
		expect(daemonLogMock).toHaveBeenCalledWith(
			expect.stringContaining("resize skipped (dead pty)"),
		);
	});

	it("skips a done session", () => {
		const resize = vi.fn();
		const sessions = new Map<string, Session>([
			[
				"1",
				makeSession({
					status: "done",
					pty: { resize } as unknown as Session["pty"],
				}),
			],
		]);

		resizeSession(sessions, "1", 120, 40);

		expect(resize).not.toHaveBeenCalled();
	});
});
