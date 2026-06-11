import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
	existsSync: vi.fn(),
	mkdirSync: vi.fn(),
	writeFileSync: vi.fn(),
	unlinkSync: vi.fn(),
}));

import { consumePause, isPausePending, requestPause } from "./consumePause";

const mockExistsSync = existsSync as unknown as ReturnType<typeof vi.fn>;
const mockMkdirSync = mkdirSync as unknown as ReturnType<typeof vi.fn>;
const mockWriteFileSync = writeFileSync as unknown as ReturnType<typeof vi.fn>;
const mockUnlinkSync = unlinkSync as unknown as ReturnType<typeof vi.fn>;

const expectedPausePath = join(
	homedir(),
	".assist",
	"controls",
	"pause-42.json",
);

describe("pauseControl", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("requestPause", () => {
		it("writes a pause file at the global controls path", () => {
			requestPause(42);

			expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
			const [path] = mockWriteFileSync.mock.calls[0];
			expect(path).toBe(expectedPausePath);
		});

		it("creates the controls directory before writing", () => {
			requestPause(42);

			expect(mockMkdirSync).toHaveBeenCalledWith(
				join(homedir(), ".assist", "controls"),
				{ recursive: true },
			);
		});
	});

	describe("isPausePending", () => {
		it("returns false when no pause file exists", () => {
			mockExistsSync.mockReturnValue(false);

			expect(isPausePending(42)).toBe(false);
		});

		it("returns true when a pause file exists", () => {
			mockExistsSync.mockReturnValue(true);

			expect(isPausePending(42)).toBe(true);
		});
	});

	describe("consumePause", () => {
		it("returns false and removes nothing when no pause is pending", () => {
			mockExistsSync.mockReturnValue(false);

			expect(consumePause(42)).toBe(false);
			expect(mockUnlinkSync).not.toHaveBeenCalled();
		});

		it("returns true and removes the file when a pause is pending", () => {
			mockExistsSync.mockReturnValue(true);

			expect(consumePause(42)).toBe(true);
			expect(mockUnlinkSync).toHaveBeenCalledTimes(1);
			expect(mockUnlinkSync.mock.calls[0][0]).toBe(expectedPausePath);
		});

		it("does not throw when the pause file is already gone", () => {
			mockExistsSync.mockReturnValue(true);
			mockUnlinkSync.mockImplementation(() => {
				throw new Error("ENOENT");
			});

			expect(() => consumePause(42)).not.toThrow();
		});
	});
});
