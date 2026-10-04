import { describe, expect, it, vi } from "vitest";
import { daemonLog } from "./daemonLog";
import { dropUnrestorableSessions } from "./dropUnrestorableSessions";
import type { PersistedSession } from "./loadPersistedSessions";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./worktree/underTempRoot", () => ({
	underTempRoot: (path: string) => path.startsWith("/tmp/"),
}));

const persisted = (overrides: Partial<PersistedSession>): PersistedSession => ({
	name: "s",
	commandType: "assist",
	cwd: "/git/repo",
	startedAt: 1,
	...overrides,
});

describe("dropUnrestorableSessions", () => {
	it("drops temp-rooted sessions and retired watchers, keeping the rest", () => {
		const kept = persisted({ name: "kept" });

		const result = dropUnrestorableSessions([
			kept,
			persisted({ name: "tmp", cwd: "/tmp/x" }),
			persisted({ name: "assist watch loop", watcher: true }),
		]);

		expect(result).toEqual([kept]);
		expect(daemonLog).toHaveBeenCalledWith(
			expect.stringContaining("is a retired watcher session"),
		);
	});
});
