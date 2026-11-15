import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as makePtyModule from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";

vi.mock("./spawnCodex", async () => {
	const { makePty } = await vi.importActual<typeof makePtyModule>(
		"../../../test/mothers/makePty",
	);
	return { spawnCodex: vi.fn(() => makePty().pty) };
});
vi.mock("./spawnClaude", async () => {
	const { makePty } = await vi.importActual<typeof makePtyModule>(
		"../../../test/mothers/makePty",
	);
	return { spawnClaude: vi.fn(() => makePty().pty) };
});
vi.mock("../shared/codex/resolveCodexSessionId", () => ({
	resolveCodexSessionId: vi.fn(async () => "new-rollout"),
}));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./watchTranscript", () => ({ watchTranscript: vi.fn() }));
vi.mock("./recordBoundPhaseSession", () => ({
	recordBoundPhaseSession: vi.fn(async () => {}),
}));
vi.mock("./rememberSessionTitle", () => ({ rememberSessionTitle: vi.fn() }));

import { resolveCodexSessionId } from "../shared/codex/resolveCodexSessionId";
import { daemonLog } from "./daemonLog";
import { restartSession } from "./restartSession";
import { watchTranscript } from "./watchTranscript";

describe("restartSession rebinding", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	it("binds a started-over Codex session to its new conversation", async () => {
		const session = makeSession({
			harness: "codex",
			status: "done",
			cwd: "/repo",
			initialPrompt: "Original task",
			harnessSessionId: "old",
			error: "stale failure",
		});
		const notify = vi.fn();

		restartSession(session, new Set(), vi.fn(), true, notify);
		expect(session.harnessSessionId).toBeUndefined();
		expect(session.error).toBeUndefined();

		await vi.advanceTimersByTimeAsync(1000);

		expect(resolveCodexSessionId).toHaveBeenCalledWith(
			expect.objectContaining({ cwd: "/repo", launchedAt: session.startedAt }),
		);
		expect(session.harnessSessionId).toBe("new-rollout");
		expect(daemonLog).toHaveBeenCalledWith(
			`session 1 bound to Codex conversation new-rollout`,
		);
		expect(watchTranscript).toHaveBeenCalledWith(
			session,
			notify,
			expect.any(Function),
		);
		expect(notify).toHaveBeenCalled();
	});

	it("keeps a started-over Claude session on its preassigned id", async () => {
		const session = makeSession({
			status: "done",
			cwd: "/repo",
			initialPrompt: "Original task",
			claudeSessionId: "old",
		});

		restartSession(session, new Set(), vi.fn(), true, vi.fn());
		const preassigned = session.claudeSessionId;
		await vi.advanceTimersByTimeAsync(1000);

		expect(preassigned).toBeTruthy();
		expect(preassigned).not.toBe("old");
		expect(session.claudeSessionId).toBe(preassigned);
		expect(resolveCodexSessionId).not.toHaveBeenCalled();
	});
});
