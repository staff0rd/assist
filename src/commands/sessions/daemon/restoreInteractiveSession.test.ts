import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("./spawnClaude", () => ({ spawnClaude: vi.fn(() => "claude-pty") }));
vi.mock("./spawnCodex", () => ({ spawnCodex: vi.fn(() => "codex-pty") }));
vi.mock("./hasTranscriptOnDisk", () => ({
	hasTranscriptOnDisk: vi.fn(() => true),
}));
vi.mock("../../backlog/buildResumePrompt", () => ({
	buildResumePrompt: vi.fn(() => "resume nudge"),
}));

import type { PersistedSession } from "./loadPersistedSessions";
import { restoreBase } from "./restoreBase";
import { restoreInteractiveSession } from "./restoreInteractiveSession";
import { spawnClaude } from "./spawnClaude";
import { spawnCodex } from "./spawnCodex";

const mockSpawnClaude = spawnClaude as unknown as MockInstance;
const mockSpawnCodex = spawnCodex as unknown as MockInstance;

function persistedSession(
	overrides: Partial<PersistedSession> = {},
): PersistedSession {
	return {
		name: "repo/Session 1",
		commandType: "claude",
		cwd: "/repo",
		startedAt: 1,
		...overrides,
	};
}

function restore(persisted: PersistedSession) {
	return restoreInteractiveSession(
		"1",
		persisted,
		restoreBase("1", persisted),
		"running",
	);
}

describe("restoreInteractiveSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("for a claude session with a recorded conversation", () => {
		it("resumes it", () => {
			const session = restore(persistedSession({ claudeSessionId: "conv-1" }));

			expect(session.status).toBe("running");
			expect(mockSpawnClaude).toHaveBeenCalledWith(
				expect.objectContaining({ resumeSessionId: "conv-1" }),
			);
		});
	});

	describe("for a claude session launched in auto mode", () => {
		it("resumes it in auto mode after a daemon restart", () => {
			restore(persistedSession({ claudeSessionId: "conv-1", auto: true }));

			expect(mockSpawnClaude).toHaveBeenCalledWith(
				expect.objectContaining({ resumeSessionId: "conv-1", auto: true }),
			);
		});
	});

	describe("for a session on a harness that cannot resume", () => {
		it("does not resume it as claude, even with a stale conversation id", () => {
			const session = restore(
				persistedSession({ harness: "pi", claudeSessionId: "stale" }),
			);

			expect(mockSpawnClaude).not.toHaveBeenCalled();
			expect(session.status).toBe("error");
		});

		it("explains the harness cannot be resumed instead of blaming a missing claude id", () => {
			const session = restore(persistedSession({ harness: "pi" }));

			expect(session.error).toBe(
				"pi sessions cannot be resumed yet, so the conversation cannot be restored",
			);
		});

		it("leaves an assist session as a retryable stub it can relaunch from its args", () => {
			const session = restore(
				persistedSession({
					commandType: "assist",
					harness: "pi",
					assistArgs: ["refine", "--harness", "pi", "a279"],
					claudeSessionId: "stale",
				}),
			);

			expect(mockSpawnClaude).not.toHaveBeenCalled();
			expect(session.status).toBe("done");
			expect(session.restored).toBe(false);
		});
	});

	describe("for a codex session", () => {
		it("resumes its recorded conversation with the restart nudge", () => {
			const session = restore(
				persistedSession({ harness: "codex", harnessSessionId: "codex-conv" }),
			);

			expect(mockSpawnClaude).not.toHaveBeenCalled();
			expect(mockSpawnCodex).toHaveBeenCalledWith({
				resumeSessionId: "codex-conv",
				prompt: "resume nudge",
				cwd: "/repo",
				sessionId: "1",
			});
			expect(session.status).toBe("running");
		});

		it("does not resume it as claude when a stale claude id is all it has", () => {
			const session = restore(
				persistedSession({ harness: "codex", claudeSessionId: "stale" }),
			);

			expect(mockSpawnClaude).not.toHaveBeenCalled();
			expect(mockSpawnCodex).not.toHaveBeenCalled();
			expect(session.error).toBe(
				"no Codex conversation id was recorded before the daemon stopped, so the conversation cannot be resumed",
			);
		});
	});

	describe("for a claude session with no recorded conversation", () => {
		it("keeps the existing unrecoverable-claude wording", () => {
			const session = restore(persistedSession());

			expect(session.error).toBe(
				"no claude session id was recorded before the daemon stopped, so the conversation cannot be resumed",
			);
		});
	});
});
