import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PersistedSession } from "./loadPersistedSessions";
import { restoreSession } from "./restoreSession";
import { spawnClaude } from "./spawnClaude";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnClaude", () => ({
	spawnClaude: vi.fn(() => ({ fake: "pty" })),
}));

vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({ fake: "pty" })),
}));

const spawnClaudeMock = spawnClaude as unknown as ReturnType<typeof vi.fn>;
const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;

describe("restoreSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("respawns a claude session with a known sessionId via --resume", () => {
		const persisted: PersistedSession = {
			name: "repo/Fix the bug",
			commandType: "claude",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "abc-123",
		};

		const session = restoreSession("1", persisted);

		expect(spawnClaudeMock).toHaveBeenCalledWith({
			resumeSessionId: "abc-123",
			cwd: "/home/user/repo",
		});
		expect(session.status).toBe("running");
		expect(session.restored).toBe(true);
		expect(session.claudeSessionId).toBe("abc-123");
		expect(session.name).toBe("repo/Fix the bug");
	});

	it("relaunches a backlog run via the assist wrapper, not bare claude", () => {
		const persisted: PersistedSession = {
			name: "repo/Run backlog 295",
			commandType: "assist",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "abc-123",
			assistArgs: ["backlog", "run", "295"],
			activity: {
				kind: "backlog",
				itemId: 295,
				itemName: "Fix the thing",
				phase: 2,
				totalPhases: 3,
				startedAt: 5,
			},
		};

		const session = restoreSession("1", persisted);

		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "backlog", "run", "295"],
			"/home/user/repo",
			"1",
		);
		expect(session.status).toBe("running");
		expect(session.restored).toBe(true);
		expect(session.commandType).toBe("assist");
		expect(session.assistArgs).toEqual(["backlog", "run", "295"]);
		expect(session.activity).toEqual({
			kind: "backlog",
			itemId: 295,
			itemName: "Fix the thing",
			phase: 2,
			totalPhases: 3,
			startedAt: 5,
		});
	});

	it("returns a not-restored stub for a claude session without a sessionId", () => {
		const persisted: PersistedSession = {
			name: "repo/Session 1",
			commandType: "claude",
			cwd: "/home/user/repo",
			startedAt: 123,
		};

		const session = restoreSession("1", persisted);

		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(session.status).toBe("done");
		expect(session.restored).toBe(false);
		expect(session.pty).toBeNull();
	});

	it("resumes an assist session with a discovered claude sessionId", () => {
		const persisted: PersistedSession = {
			name: "repo/assist draft",
			commandType: "assist",
			cwd: "/home/user/repo",
			startedAt: 123,
			claudeSessionId: "draft-456",
			assistArgs: ["draft"],
		};

		const session = restoreSession("1", persisted);

		expect(spawnClaudeMock).toHaveBeenCalledWith({
			resumeSessionId: "draft-456",
			cwd: "/home/user/repo",
		});
		expect(session.status).toBe("running");
		expect(session.restored).toBe(true);
		expect(session.commandType).toBe("assist");
		expect(session.assistArgs).toEqual(["draft"]);
	});

	it("returns a not-restored stub for an assist session, keeping retry args", () => {
		const persisted: PersistedSession = {
			name: "repo/assist draft",
			commandType: "assist",
			cwd: "/home/user/repo",
			startedAt: 123,
			assistArgs: ["draft"],
		};

		const session = restoreSession("3", persisted);

		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(session.status).toBe("done");
		expect(session.restored).toBe(false);
		expect(session.assistArgs).toEqual(["draft"]);
	});

	it("returns a not-restored stub for a run session, keeping retry args", () => {
		const persisted: PersistedSession = {
			name: "repo/run: build",
			commandType: "run",
			cwd: "/home/user/repo",
			startedAt: 123,
			runName: "build",
			runArgs: ["--watch"],
		};

		const session = restoreSession("2", persisted);

		expect(spawnClaudeMock).not.toHaveBeenCalled();
		expect(session.status).toBe("done");
		expect(session.restored).toBe(false);
		expect(session.runName).toBe("build");
		expect(session.runArgs).toEqual(["--watch"]);
		expect(session.startedAt).toBe(123);
	});
});
