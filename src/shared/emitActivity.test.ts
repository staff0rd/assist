import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
	mkdirSync: vi.fn(),
	readFileSync: vi.fn(),
	rmSync: vi.fn(),
	writeFileSync: vi.fn(),
}));

import {
	activityPath,
	emitActivity,
	reconcileActivity,
	removeActivity,
} from "./emitActivity";

const mockMkdirSync = mkdirSync as unknown as ReturnType<typeof vi.fn>;
const mockWriteFileSync = writeFileSync as unknown as ReturnType<typeof vi.fn>;
const mockRmSync = rmSync as unknown as ReturnType<typeof vi.fn>;

const expectedDir = join(homedir(), ".assist", "activity");
const expectedPath = join(expectedDir, "activity-abc123.json");

describe("emitActivity", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		delete process.env.ASSIST_ACTIVITY_ID;
	});

	afterEach(() => {
		delete process.env.ASSIST_ACTIVITY_ID;
	});

	describe("activityPath", () => {
		it("returns the path under the global activity store keyed by session id", () => {
			expect(activityPath("abc123")).toBe(expectedPath);
		});
	});

	describe("emitActivity", () => {
		it("does nothing when ASSIST_ACTIVITY_ID is not set", () => {
			emitActivity({ kind: "command", name: "/commit" });

			expect(mockWriteFileSync).not.toHaveBeenCalled();
		});

		it("writes activity to the global store and creates the activity dir", () => {
			process.env.ASSIST_ACTIVITY_ID = "abc123";

			emitActivity({ kind: "command", name: "/commit" });

			expect(mockMkdirSync).toHaveBeenCalledWith(expectedDir, {
				recursive: true,
			});
			expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
			const [path, content] = mockWriteFileSync.mock.calls[0];
			expect(path).toBe(expectedPath);
			const parsed = JSON.parse(content);
			expect(parsed.kind).toBe("command");
			expect(parsed.name).toBe("/commit");
			expect(parsed.startedAt).toBeTypeOf("number");
		});
	});

	describe("reconcileActivity", () => {
		it("writes the session's own activity to its store path", () => {
			reconcileActivity("abc123", {
				kind: "backlog",
				itemId: 408,
				startedAt: 5,
			});

			expect(mockMkdirSync).toHaveBeenCalledWith(expectedDir, {
				recursive: true,
			});
			expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
			const [path, content] = mockWriteFileSync.mock.calls[0];
			expect(path).toBe(expectedPath);
			expect(JSON.parse(content)).toEqual({
				kind: "backlog",
				itemId: 408,
				startedAt: 5,
			});
		});

		describe("when the session has no activity", () => {
			it("removes the stale file so a prior generation's activity is dropped", () => {
				reconcileActivity("abc123", undefined);

				expect(mockWriteFileSync).not.toHaveBeenCalled();
				expect(mockRmSync).toHaveBeenCalledTimes(1);
				expect(mockRmSync.mock.calls[0][0]).toBe(expectedPath);
			});
		});
	});

	describe("removeActivity", () => {
		it("removes the activity file at the global store path", () => {
			removeActivity("abc123");

			expect(mockRmSync).toHaveBeenCalledTimes(1);
			expect(mockRmSync.mock.calls[0][0]).toBe(expectedPath);
		});

		it("does not throw when the activity file is already gone", () => {
			mockRmSync.mockImplementation(() => {
				throw new Error("ENOENT");
			});

			expect(() => removeActivity("abc123")).not.toThrow();
		});
	});
});
