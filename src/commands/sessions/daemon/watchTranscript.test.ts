import { beforeEach, describe, expect, it, vi } from "vitest";
import { watch } from "node:fs";
import type * as fsMockModule from "../../../test/mocks/fsMock";
import { makeSession } from "../../../test/mothers/makeSession";
import { findCodexRolloutPathSync } from "../shared/codex/findCodexRolloutPathSync";
import { daemonLog } from "./daemonLog";
import { ensureProjectDirExists } from "./ensureProjectDirExists";
import { reconcileTranscriptStatus } from "./reconcileTranscriptStatus";
import { startTranscriptTitleGeneration } from "./startTranscriptTitleGeneration";
import { watchTranscript } from "./watchTranscript";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../test/mocks/fsMock")
	).fsMock(),
);

vi.mock("./ensureProjectDirExists", () => ({
	ensureProjectDirExists: vi.fn(() => true),
}));

vi.mock("../shared/findTranscriptPathSync", () => ({
	projectDirForCwd: (cwd: string) => `/projects${cwd}`,
	findTranscriptPathSync: vi.fn(() => null),
}));

vi.mock("../shared/codex/findCodexRolloutPathSync", () => ({
	findCodexRolloutPathSync: vi.fn(),
}));

vi.mock("./reconcileTranscriptStatus", () => ({
	reconcileTranscriptStatus: vi.fn(),
}));

vi.mock("./startTranscriptTitleGeneration", () => ({
	startTranscriptTitleGeneration: vi.fn(),
}));

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const watchMock = vi.mocked(watch);
const ensureDirMock = vi.mocked(ensureProjectDirExists);
const titleMock = vi.mocked(startTranscriptTitleGeneration);
const reconcileMock = vi.mocked(reconcileTranscriptStatus);
const rolloutMock = vi.mocked(findCodexRolloutPathSync);

function fire(file: string) {
	const listener = watchMock.mock.calls.at(-1)?.[1] as unknown as (
		event: string,
		file: string,
	) => void;
	listener("change", file);
}

describe("watchTranscript", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		ensureDirMock.mockReturnValue(true);
		watchMock.mockImplementation((() => ({ close: vi.fn() })) as never);
	});

	it("creates the project dir so a fresh worktree still binds", () => {
		const s = makeSession({
			id: "3",
			cwd: "/home/me/fresh-worktree",
			claudeSessionId: "phase-1",
		});

		watchTranscript(s, vi.fn(), vi.fn());

		expect(ensureDirMock).toHaveBeenCalledWith(
			"/projects/home/me/fresh-worktree",
			"3",
		);
		expect(watchMock).toHaveBeenCalledTimes(1);
		expect(s.watchedTranscriptId).toBe("claude:phase-1");
	});

	it("skips binding when the project dir cannot be created", () => {
		ensureDirMock.mockReturnValue(false);
		const s = makeSession({ cwd: "/home/me/repo", claudeSessionId: "phase-1" });

		watchTranscript(s, vi.fn(), vi.fn());

		expect(watchMock).not.toHaveBeenCalled();
		expect(s.watchedTranscriptId).toBeUndefined();
	});

	it("does not re-bind while the conversation is unchanged", () => {
		const s = makeSession({ cwd: "/home/me/repo", claudeSessionId: "phase-1" });

		watchTranscript(s, vi.fn(), vi.fn());
		watchTranscript(s, vi.fn(), vi.fn());

		expect(watchMock).toHaveBeenCalledTimes(1);
	});

	it("offers each watcher fire to title generation", () => {
		const notify = vi.fn();
		const s = makeSession({ cwd: "/home/me/repo", claudeSessionId: "phase-1" });

		watchTranscript(s, notify, vi.fn());

		expect(titleMock).toHaveBeenCalledWith(s, notify);
	});

	it("follows a phase transition to a new claude session id, closing the stale watcher", () => {
		const close = vi.fn();
		watchMock.mockImplementationOnce((() => ({ close })) as never);
		const s = makeSession({
			cwd: "/home/me/repo",
			claudeSessionId: "phase-1",
			transcriptPath: "/projects/home/me/repo/phase-1.jsonl",
		});

		watchTranscript(s, vi.fn(), vi.fn());
		s.claudeSessionId = "phase-2";
		watchTranscript(s, vi.fn(), vi.fn());

		expect(close).toHaveBeenCalledTimes(1);
		expect(watchMock).toHaveBeenCalledTimes(2);
		expect(s.watchedTranscriptId).toBe("claude:phase-2");
		expect(s.transcriptPath).toBeUndefined();
	});

	describe("codex sessions", () => {
		const rollout = "/codex/2026/11/10/rollout-x-conv-1.jsonl";

		it("waits for the conversation to be bound, without a claude id", () => {
			const s = makeSession({ cwd: "/home/me/repo", harness: "codex" });

			watchTranscript(s, vi.fn(), vi.fn());

			expect(watchMock).not.toHaveBeenCalled();
			expect(s.claudeSessionId).toBeUndefined();
		});

		it("watches the bound rollout's directory and reacts only to that file", async () => {
			rolloutMock.mockReturnValue(rollout);
			const s = makeSession({
				cwd: "/home/me/repo",
				harness: "codex",
				harnessSessionId: "conv-1",
			});

			watchTranscript(s, vi.fn(), vi.fn());

			expect(watchMock.mock.calls[0][0]).toBe("/codex/2026/11/10");
			expect(s.watchedTranscriptId).toBe("codex:conv-1");
			expect(reconcileMock).toHaveBeenCalledTimes(1);

			vi.useFakeTimers();
			fire("rollout-other.jsonl");
			fire("rollout-x-conv-1.jsonl");
			vi.advanceTimersByTime(200);
			vi.useRealTimers();
			expect(reconcileMock).toHaveBeenCalledTimes(2);
		});

		it("drops the watcher when a fresh launch unbinds the conversation, then rebinds", () => {
			rolloutMock.mockReturnValue(rollout);
			const close = vi.fn();
			watchMock.mockImplementationOnce((() => ({ close })) as never);
			const s = makeSession({
				cwd: "/home/me/repo",
				harness: "codex",
				harnessSessionId: "conv-1",
			});
			watchTranscript(s, vi.fn(), vi.fn());

			s.harnessSessionId = undefined;
			watchTranscript(s, vi.fn(), vi.fn());

			expect(close).toHaveBeenCalledTimes(1);
			expect(s.watchedTranscriptId).toBeUndefined();

			rolloutMock.mockReturnValue("/codex/2026/11/10/rollout-y-conv-2.jsonl");
			s.harnessSessionId = "conv-2";
			watchTranscript(s, vi.fn(), vi.fn());

			expect(s.watchedTranscriptId).toBe("codex:conv-2");
		});
	});

	it("logs once and watches nothing for a harness that cannot read transcripts", () => {
		const s = makeSession({ id: "9", cwd: "/home/me/repo", harness: "pi" });

		watchTranscript(s, vi.fn(), vi.fn());
		watchTranscript(s, vi.fn(), vi.fn());

		expect(watchMock).not.toHaveBeenCalled();
		expect(
			vi
				.mocked(daemonLog)
				.mock.calls.filter(([line]) => line.includes("transcript not read")),
		).toEqual([
			[
				"session 9 transcript not read: assist cannot read pi conversation transcripts yet",
			],
		]);
	});
});
