import { describe, expect, it, vi } from "vitest";
import type { PersistedSession } from "./persistedSessionSchema";
import { restoreBase } from "./restoreBase";

vi.mock("../../backlog/consumePause", () => ({ isPausePending: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function persisted(
	overrides: Partial<PersistedSession> = {},
): PersistedSession {
	return {
		name: "s",
		commandType: "assist",
		cwd: "/repo",
		startedAt: 1,
		...overrides,
	};
}

describe("restoreBase", () => {
	it("drops a persisted star from a watcher", () => {
		const base = restoreBase("1", persisted({ watcher: true, starred: true }));

		expect(base.starred).toBe(false);
		expect(base.watcher).toBe(true);
	});

	it("keeps a persisted star on a non-watcher", () => {
		expect(restoreBase("1", persisted({ starred: true })).starred).toBe(true);
	});
});
