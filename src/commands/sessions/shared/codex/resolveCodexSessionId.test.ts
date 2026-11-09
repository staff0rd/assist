import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPaths = vi.fn<() => Promise<string[]>>();

vi.mock("./discoverCodexRolloutPaths", () => ({
	discoverCodexRolloutPaths: () => mockPaths(),
}));

import { resolveCodexSessionId } from "./resolveCodexSessionId";

const dir = mkdtempSync(join(tmpdir(), "codex-resolve-"));

function rollout(sessionId: string, cwd: string, timestamp: string): string {
	const file = join(dir, `rollout-${sessionId}.jsonl`);
	writeFileSync(
		file,
		`${JSON.stringify({
			type: "session_meta",
			payload: { session_id: sessionId, cwd, timestamp },
		})}\n`,
	);
	return file;
}

const START = Date.parse("2026-08-09T11:00:00.000Z");
const SLACK_MS = 5000;

function launch(
	cwd: string,
	launchedAt = START,
	claimed: string[] = [],
): Parameters<typeof resolveCodexSessionId>[0] {
	return {
		cwd,
		launchedAt,
		sinceMs: launchedAt - SLACK_MS,
		claimed: new Set(claimed),
	};
}

describe("resolveCodexSessionId", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("binds the first conversation codex started in the session's cwd after the launch", async () => {
		mockPaths.mockResolvedValue([
			rollout("own", "/repo", "2026-08-09T11:00:01.000Z"),
			rollout("later", "/repo", "2026-08-09T11:00:03.000Z"),
		]);

		expect(await resolveCodexSessionId(launch("/repo"))).toBe("own");
	});

	it("keeps concurrent launches in a shared worktree on their own conversations", async () => {
		mockPaths.mockResolvedValue([
			rollout("first", "/repo", "2026-08-09T11:00:01.000Z"),
			rollout("second", "/repo", "2026-08-09T11:00:03.000Z"),
		]);

		expect(await resolveCodexSessionId(launch("/repo", START + 2000))).toBe(
			"second",
		);
		expect(await resolveCodexSessionId(launch("/repo"))).toBe("first");
	});

	it("never binds a conversation another session has claimed", async () => {
		mockPaths.mockResolvedValue([
			rollout("taken", "/repo", "2026-08-09T11:00:01.000Z"),
			rollout("free", "/repo", "2026-08-09T11:00:03.000Z"),
		]);

		expect(await resolveCodexSessionId(launch("/repo", START, ["taken"]))).toBe(
			"free",
		);
	});

	it("falls back to the newest rollout inside the slack when none started after the launch", async () => {
		mockPaths.mockResolvedValue([
			rollout("older", "/repo", "2026-08-09T10:59:56.000Z"),
			rollout("newest", "/repo", "2026-08-09T10:59:58.000Z"),
		]);

		expect(await resolveCodexSessionId(launch("/repo"))).toBe("newest");
	});

	it("ignores conversations from another working directory", async () => {
		mockPaths.mockResolvedValue([
			rollout("elsewhere", "/other", "2026-08-09T11:02:00.000Z"),
		]);

		expect(await resolveCodexSessionId(launch("/repo"))).toBeNull();
	});

	it("ignores conversations that started before the session did", async () => {
		mockPaths.mockResolvedValue([
			rollout("earlier", "/repo", "2026-08-09T10:59:00.000Z"),
		]);

		expect(await resolveCodexSessionId(launch("/repo"))).toBeNull();
	});

	it("resolves nothing without a cwd to match on", async () => {
		expect(await resolveCodexSessionId(launch(""))).toBeNull();
		expect(mockPaths).not.toHaveBeenCalled();
	});
});
