import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockExistsSync = vi.fn();
const mockReadFileSync = vi.fn();
const mockWriteFileSync = vi.fn();
const mockUnlinkSync = vi.fn();

vi.mock("node:fs", () => ({
	existsSync: (...args: unknown[]) => mockExistsSync(...args),
	readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
	writeFileSync: (...args: unknown[]) => mockWriteFileSync(...args),
	unlinkSync: (...args: unknown[]) => mockUnlinkSync(...args),
}));

vi.mock("./getRestrictedDir", () => ({
	getPinStatePath: (pin: string) => `/pins/${pin}.json`,
}));

vi.mock("./sweepRestrictedDir", () => ({
	sweepRestrictedDir: vi.fn(),
}));

import { codeCommentConfirm } from "./codeCommentConfirm";

describe("codeCommentConfirm", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;
	let errorSpy: ReturnType<typeof vi.spyOn>;

	function primePin(file: string, line: number, text: string): void {
		const pinPath = "/pins/123.json";
		mockExistsSync.mockImplementation(
			(path: string) => path === pinPath || path === file,
		);
		mockReadFileSync.mockImplementation((path: string) => {
			if (path === pinPath) {
				return JSON.stringify({ pin: "123", file, line, text });
			}
			return "root:\n  child: value\n";
		});
	}

	function writtenContent(): string {
		return mockWriteFileSync.mock.calls[0][1] as string;
	}

	beforeEach(() => {
		vi.clearAllMocks();
		process.exitCode = undefined;
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
		errorSpy.mockRestore();
		process.exitCode = undefined;
	});

	it("inserts a # comment for a .yml pin", () => {
		primePin("config.yml", 2, "explains the override");

		codeCommentConfirm("123");

		expect(writtenContent()).toContain("  # explains the override");
		expect(mockUnlinkSync).toHaveBeenCalledWith("/pins/123.json");
	});

	it("inserts a // comment for a .ts pin", () => {
		primePin("src/foo.ts", 2, "guards the edge case");

		codeCommentConfirm("123");

		expect(writtenContent()).toContain("  // guards the edge case");
	});
});
