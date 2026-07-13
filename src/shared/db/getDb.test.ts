import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { poolEnd, PoolMock } = vi.hoisted(() => {
	const end = vi.fn(() => Promise.resolve());
	class FakePool {
		on = vi.fn();
		end = end;
	}
	return { poolEnd: end, PoolMock: vi.fn(FakePool) };
});

vi.mock("pg", () => ({ Pool: PoolMock }));
vi.mock("./migrations/assertMigrationsInSync", () => ({
	assertMigrationsInSync: vi.fn(),
}));
vi.mock("./migrations/MigrationExecutor", () => ({
	pgExecutor: vi.fn(() => ({})),
}));
vi.mock("./Db", () => ({ makeOrmFromPool: vi.fn(() => ({ orm: true })) }));
vi.mock("../../commands/backlog/seedNewsFeeds", () => ({
	seedNewsFeeds: vi.fn(() => Promise.resolve()),
}));
vi.mock("./cleanupFalseResetSegments", () => ({
	cleanupFalseResetSegments: vi.fn(() => Promise.resolve()),
}));

import { assertMigrationsInSync } from "./migrations/assertMigrationsInSync";
import { closeDb, getDb } from "./getDb";

const assertMock = assertMigrationsInSync as unknown as ReturnType<
	typeof vi.fn
>;

describe("getDb", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.env.ASSIST_DATABASE_URL = "postgres://user:pass@host:5432/db";
	});

	afterEach(async () => {
		await closeDb();
		delete process.env.ASSIST_DATABASE_URL;
	});

	it("clears the cached connection on failure so a later call reconnects", async () => {
		assertMock.mockRejectedValueOnce(
			new Error("getaddrinfo ENOTFOUND aws.pooler.supabase.com"),
		);

		await expect(getDb()).rejects.toThrow("ENOTFOUND");
		expect(poolEnd).toHaveBeenCalledTimes(1);

		assertMock.mockResolvedValueOnce(undefined);
		await expect(getDb()).resolves.toEqual({ orm: true });
		expect(PoolMock).toHaveBeenCalledTimes(2);
	});

	it("caches a successful connection for later calls", async () => {
		assertMock.mockResolvedValue(undefined);

		const first = await getDb();
		const second = await getDb();

		expect(first).toBe(second);
		expect(PoolMock).toHaveBeenCalledTimes(1);
	});
});
