import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
	existsSync: vi.fn(),
	readFileSync: vi.fn(),
	writeFileSync: vi.fn(),
}));

import {
	hasSummary,
	readSummary,
	summaryPathFor,
	writeSummary,
} from "./shared";

const mockExistsSync = existsSync as unknown as ReturnType<typeof vi.fn>;
const mockReadFileSync = readFileSync as unknown as ReturnType<typeof vi.fn>;
const mockWriteFileSync = writeFileSync as unknown as ReturnType<typeof vi.fn>;

describe("summaryFile", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("summaryPathFor", () => {
		it("replaces .jsonl with .summary", () => {
			expect(summaryPathFor("/path/to/session-id.jsonl")).toBe(
				"/path/to/session-id.summary",
			);
		});
	});

	describe("readSummary", () => {
		it("returns the summary content trimmed", () => {
			mockReadFileSync.mockReturnValue("Implemented backlog #42\n");

			expect(readSummary("/s.jsonl")).toBe("Implemented backlog #42");
		});

		it("returns undefined for missing file", () => {
			mockReadFileSync.mockImplementation(() => {
				throw new Error("ENOENT");
			});

			expect(readSummary("/s.jsonl")).toBeUndefined();
		});

		it("returns undefined for empty file", () => {
			mockReadFileSync.mockReturnValue("");

			expect(readSummary("/s.jsonl")).toBeUndefined();
		});

		it("reads from the .summary path", () => {
			mockReadFileSync.mockReturnValue("summary text\n");

			readSummary("/path/abc.jsonl");

			expect(mockReadFileSync).toHaveBeenCalledWith(
				"/path/abc.summary",
				"utf8",
			);
		});
	});

	describe("writeSummary", () => {
		it("writes trimmed summary with trailing newline", () => {
			writeSummary("/s.jsonl", "  A summary  ");

			expect(mockWriteFileSync).toHaveBeenCalledWith(
				"/s.summary",
				"A summary\n",
				"utf8",
			);
		});
	});

	describe("hasSummary", () => {
		it("returns true when .summary file exists", () => {
			mockExistsSync.mockReturnValue(true);

			expect(hasSummary("/s.jsonl")).toBe(true);
			expect(mockExistsSync).toHaveBeenCalledWith("/s.summary");
		});

		it("returns false when .summary file does not exist", () => {
			mockExistsSync.mockReturnValue(false);

			expect(hasSummary("/s.jsonl")).toBe(false);
		});
	});
});
