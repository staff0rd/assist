import { beforeEach, describe, expect, it, vi } from "vitest";
import { isPausePending } from "../../backlog/consumePause";
import { resumedRunEnv } from "./resumedRunEnv";

vi.mock("../../backlog/consumePause", () => ({ isPausePending: vi.fn() }));

const isPausePendingMock = isPausePending as unknown as ReturnType<
	typeof vi.fn
>;

const busy = { idle: false };
const idle = { idle: true };

describe("resumedRunEnv", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		isPausePendingMock.mockReturnValue(false);
	});

	it("is undefined for a busy run with no pending pause", () => {
		expect(resumedRunEnv(42, busy)).toBeUndefined();
	});

	it("signals the wrapper to skip the resume nudge when idle", () => {
		expect(resumedRunEnv(42, idle)).toEqual({ ASSIST_RESUME_IDLE: "1" });
	});

	it("keeps a pending pause alive across the relaunch", () => {
		isPausePendingMock.mockReturnValue(true);

		expect(resumedRunEnv(42, busy)).toEqual({ ASSIST_KEEP_PAUSE: "1" });
		expect(isPausePendingMock).toHaveBeenCalledWith(42);
	});

	it("combines the idle nudge and the kept pause", () => {
		isPausePendingMock.mockReturnValue(true);

		expect(resumedRunEnv(42, idle)).toEqual({
			ASSIST_RESUME_IDLE: "1",
			ASSIST_KEEP_PAUSE: "1",
		});
	});

	it("ignores the pause file for a session with no backlog item", () => {
		isPausePendingMock.mockReturnValue(true);

		expect(resumedRunEnv(undefined, busy)).toBeUndefined();
		expect(isPausePendingMock).not.toHaveBeenCalled();
	});

	it("hands the wrapper the daemon-restart reason to nudge with", () => {
		expect(
			resumedRunEnv(undefined, { idle: false, prompt: "the daemon restarted" }),
		).toEqual({ ASSIST_RESUME_PROMPT: "the daemon restarted" });
	});
});
