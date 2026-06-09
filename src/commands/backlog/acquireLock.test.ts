import {
	existsSync,
	mkdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
	existsSync: vi.fn(),
	mkdirSync: vi.fn(),
	readFileSync: vi.fn(),
	writeFileSync: vi.fn(),
	unlinkSync: vi.fn(),
}));

import { acquireLock, isLockedByOther, releaseLock } from "./acquireLock";

const mockExistsSync = existsSync as unknown as ReturnType<typeof vi.fn>;
const mockMkdirSync = mkdirSync as unknown as ReturnType<typeof vi.fn>;
const mockReadFileSync = readFileSync as unknown as ReturnType<typeof vi.fn>;
const mockWriteFileSync = writeFileSync as unknown as ReturnType<typeof vi.fn>;
const mockUnlinkSync = unlinkSync as unknown as ReturnType<typeof vi.fn>;

const expectedLockPath = join(homedir(), ".assist", "locks", "lock-42.json");

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
		it("writes a lock file with current PID at the global store path", () => {
			acquireLock(42);

			expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
			const [path, content] = mockWriteFileSync.mock.calls[0];
			expect(path).toBe(expectedLockPath);
			const parsed = JSON.parse(content);
			expect(parsed.pid).toBe(process.pid);
			expect(parsed.timestamp).toBeDefined();
		});

		it("creates the locks directory before writing", () => {
			acquireLock(42);

			expect(mockMkdirSync).toHaveBeenCalledWith(
				join(homedir(), ".assist", "locks"),
				{ recursive: true },
			);
		});
	});

	describe("releaseLock", () => {
		it("removes the lock file", () => {
			releaseLock(42);

			expect(mockUnlinkSync).toHaveBeenCalledTimes(1);
			const [path] = mockUnlinkSync.mock.calls[0];
			expect(path).toBe(expectedLockPath);
		});

		it("does not throw when lock file is already gone", () => {
			mockUnlinkSync.mockImplementation(() => {
				throw new Error("ENOENT");
			});

			expect(() => releaseLock(42)).not.toThrow();
		});
	});
});
