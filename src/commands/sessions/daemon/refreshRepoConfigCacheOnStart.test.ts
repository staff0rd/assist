import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../../shared/db/createTestDb";
import { readRepoConfigCache } from "../../../shared/readRepoConfigCache";
import { seedRepoConfigs } from "../../../test/mothers/seedRepoConfigs";
import { writeRepoConfigCache } from "../../../shared/writeRepoConfigCache";
import { refreshRepoConfigCacheOnStart } from "./refreshRepoConfigCacheOnStart";

const mockGetDb = vi.fn();
const mockDaemonLog = vi.fn();

vi.mock("../../../shared/db/getDb", () => ({
	getDb: () => mockGetDb(),
}));

vi.mock("./daemonLog", () => ({
	daemonLog: (line: string) => mockDaemonLog(line),
}));

describe("refreshRepoConfigCacheOnStart", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		writeRepoConfigCache({ assist: { worktree: { enabled: true } } });
	});

	it("mirrors the db rows into the cache", async () => {
		const { orm } = await createTestDb();
		await seedRepoConfigs(orm, { planner: { commit: { push: true } } });
		mockGetDb.mockResolvedValue(orm);

		await refreshRepoConfigCacheOnStart();

		expect(readRepoConfigCache()).toEqual({
			planner: { commit: { push: true } },
		});
		expect(mockDaemonLog).toHaveBeenCalledWith(
			"repo config cache refreshed (1 repos)",
		);
	});

	it("keeps the last snapshot when the db is unreachable", async () => {
		mockGetDb.mockRejectedValue(new Error("connect ECONNREFUSED"));

		await refreshRepoConfigCacheOnStart();

		expect(readRepoConfigCache()).toEqual({
			assist: { worktree: { enabled: true } },
		});
		expect(mockDaemonLog.mock.calls[0][0]).toContain(
			"keeping the last snapshot",
		);
	});
});
