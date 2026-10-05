import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../../shared/db/createTestDb";
import { readRepoConfigCache } from "../../../shared/readRepoConfigCache";
import { writeRepoConfigCache } from "../../../shared/writeRepoConfigCache";
import { seedRepoConfigs } from "../../../test/mothers/seedRepoConfigs";
import { pollRepoConfigCache } from "./pollRepoConfigCache";

const mockGetDb = vi.fn();
const mockDaemonLog = vi.fn();

vi.mock("../../../shared/db/getDb", () => ({
	getDb: () => mockGetDb(),
}));

vi.mock("./daemonLog", () => ({
	daemonLog: (line: string) => mockDaemonLog(line),
}));

describe("pollRepoConfigCache", () => {
	let stop: () => void = () => {};

	beforeEach(() => {
		vi.clearAllMocks();
		writeRepoConfigCache({ assist: { worktree: { enabled: true } } });
	});

	afterEach(() => stop());

	it("picks up a row another node wrote, without a restart", async () => {
		const { orm } = await createTestDb();
		mockGetDb.mockResolvedValue(orm);
		stop = pollRepoConfigCache(10);

		await seedRepoConfigs(orm, { planner: { commit: { push: true } } });

		await vi.waitFor(() =>
			expect(readRepoConfigCache()).toEqual({
				planner: { commit: { push: true } },
			}),
		);
		expect(mockDaemonLog).toHaveBeenCalledWith(
			"repo config cache updated (1 repos)",
		);
	});

	it("drops a key another node unset", async () => {
		const { orm } = await createTestDb();
		await seedRepoConfigs(orm, {
			assist: { worktree: { enabled: true }, commit: { push: true } },
		});
		mockGetDb.mockResolvedValue(orm);
		stop = pollRepoConfigCache(10);
		await vi.waitFor(() =>
			expect(readRepoConfigCache().assist).toHaveProperty("commit"),
		);

		await seedRepoConfigs(orm, { assist: { worktree: { enabled: true } } });

		await vi.waitFor(() =>
			expect(readRepoConfigCache()).toEqual({
				assist: { worktree: { enabled: true } },
			}),
		);
	});

	it("keeps the last snapshot and logs the failure once while the db is unreachable", async () => {
		mockGetDb.mockRejectedValue(new Error("connect ECONNREFUSED"));
		stop = pollRepoConfigCache(10);

		await vi.waitFor(() =>
			expect(mockGetDb.mock.calls.length).toBeGreaterThan(2),
		);

		expect(readRepoConfigCache()).toEqual({
			assist: { worktree: { enabled: true } },
		});
		expect(mockDaemonLog).toHaveBeenCalledTimes(1);
		expect(mockDaemonLog.mock.calls[0][0]).toContain(
			"keeping the last snapshot",
		);
	});
});
