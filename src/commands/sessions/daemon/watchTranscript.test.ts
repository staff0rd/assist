import { beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync, watch } from "node:fs";
import type { Session } from "./createSession";
import { watchTranscript } from "./watchTranscript";

vi.mock("node:fs", () => ({
	existsSync: vi.fn(() => true),
	watch: vi.fn(),
}));

vi.mock("../shared/findTranscriptPathSync", () => ({
	projectDirForCwd: (cwd: string) => `/projects${cwd}`,
}));

vi.mock("./reconcileTranscriptStatus", () => ({
	reconcileTranscriptStatus: vi.fn(),
}));

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const watchMock = watch as unknown as ReturnType<typeof vi.fn>;
const existsMock = existsSync as unknown as ReturnType<typeof vi.fn>;

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "3",
		status: "running",
		cwd: "/home/me/repo",
		claudeSessionId: "phase-1",
		...overrides,
	} as unknown as Session;
}

describe("watchTranscript", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(true);
		watchMock.mockImplementation(() => ({ close: vi.fn() }));
	});

	it("binds a watcher for the session's current transcript", () => {
		const s = session();

		watchTranscript(s, vi.fn());

		expect(watchMock).toHaveBeenCalledTimes(1);
		expect(s.watchedTranscriptId).toBe("phase-1");
	});

	it("does not re-bind while the claude session id is unchanged", () => {
		const s = session();

		watchTranscript(s, vi.fn());
		watchTranscript(s, vi.fn());

		expect(watchMock).toHaveBeenCalledTimes(1);
	});

	it("follows a phase transition to a new claude session id, closing the stale watcher", () => {
		const close = vi.fn();
		watchMock.mockImplementationOnce(() => ({ close }));
		const s = session({
			transcriptPath: "/projects/home/me/repo/phase-1.jsonl",
		});

		watchTranscript(s, vi.fn());
		s.claudeSessionId = "phase-2";
		watchTranscript(s, vi.fn());

		expect(close).toHaveBeenCalledTimes(1);
		expect(watchMock).toHaveBeenCalledTimes(2);
		expect(s.watchedTranscriptId).toBe("phase-2");
		expect(s.transcriptPath).toBeUndefined();
	});
});
