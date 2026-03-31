import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
	existsSync: vi.fn(),
	readFileSync: vi.fn(),
	writeFileSync: vi.fn(),
	unlinkSync: vi.fn(),
}));

import { acquireLock, isLockedByOther, releaseLock } from "./acquireLock";

const mockExistsSync = existsSync as unknown as ReturnType<typeof vi.fn>;
const mockReadFileSync = readFileSync as unknown as ReturnType<typeof vi.fn>;
const mockWriteFileSync = writeFileSync as unknown as ReturnType<typeof vi.fn>;
const mockUnlinkSync = unlinkSync as unknown as ReturnType<typeof vi.fn>;

describe("lockFile", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("isLockedByOther", () => {
		it("returns false when no lock file exists", () => {
			mockExistsSync.mockReturnValue(false);

			expect(isLockedByOther(1)).toBe(false);
		});

		it("returns false when lock is held by current process", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(
				JSON.stringify({ pid: process.pid, timestamp: "2026-01-01" }),
			);

			expect(isLockedByOther(1)).toBe(false);
		});

		it("returns true when lock is held by another live process", () => {
			mockExistsSync.mockReturnValue(true);
			// Use parent PID — always alive during tests
			mockReadFileSync.mockReturnValue(
				JSON.stringify({ pid: process.ppid, timestamp: "2026-01-01" }),
			);

			expect(isLockedByOther(1)).toBe(true);
		});

		it("returns false when lock is held by a dead process", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(
				JSON.stringify({ pid: 999999999, timestamp: "2026-01-01" }),
			);

			expect(isLockedByOther(1)).toBe(false);
		});

		it("returns false when lock file is corrupt", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue("not json");

			expect(isLockedByOther(1)).toBe(false);
		});
	});

	describe("acquireLock", () => {
		it("writes a lock file with current PID", () => {
			acquireLock(42);

			expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
			const [path, content] = mockWriteFileSync.mock.calls[0];
			expect(path).toContain(".assist-lock-42.json");
			const parsed = JSON.parse(content);
			expect(parsed.pid).toBe(process.pid);
			expect(parsed.timestamp).toBeDefined();
		});
	});

	describe("releaseLock", () => {
		it("removes the lock file", () => {
			releaseLock(42);

			expect(mockUnlinkSync).toHaveBeenCalledTimes(1);
			const [path] = mockUnlinkSync.mock.calls[0];
			expect(path).toContain(".assist-lock-42.json");
		});

		it("does not throw when lock file is already gone", () => {
			mockUnlinkSync.mockImplementation(() => {
				throw new Error("ENOENT");
			});

			expect(() => releaseLock(42)).not.toThrow();
		});
	});
});
