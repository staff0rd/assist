import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadProjectConfig = vi.fn<() => Record<string, unknown>>();
const mockSaveConfig = vi.fn();

vi.mock("../../shared/loadConfig", () => ({
	loadProjectConfig: () => mockLoadProjectConfig(),
	saveConfig: (c: unknown) => mockSaveConfig(c),
}));

const mockExistsSync = vi.fn<(p: string) => boolean>();
const mockUnlinkSync = vi.fn();

vi.mock("node:fs", () => ({
	existsSync: (p: string) => mockExistsSync(p),
	unlinkSync: (p: string) => mockUnlinkSync(p),
}));

import { remove } from "./remove";

let exitCode: number | undefined;
let errorOutput: string[];
let logOutput: string[];

beforeEach(() => {
	vi.clearAllMocks();
	exitCode = undefined;
	errorOutput = [];
	logOutput = [];

	vi.spyOn(process, "exit").mockImplementation((code) => {
		exitCode = code as number;
		throw new Error(`process.exit(${code})`);
	});
	vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
		errorOutput.push(args.join(" "));
	});
	vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
		logOutput.push(args.join(" "));
	});
});

function setArgv(name: string): void {
	process.argv = ["node", "assist", "run", "remove", name];
}

describe("remove", () => {
	it("removes config and deletes command file when both exist", () => {
		setArgv("lint");
		mockLoadProjectConfig.mockReturnValue({
			run: [
				{ name: "lint", command: "eslint" },
				{ name: "test", command: "vitest" },
			],
		});
		mockExistsSync.mockReturnValue(true);

		remove();

		expect(mockSaveConfig).toHaveBeenCalledWith({
			run: [{ name: "test", command: "vitest" }],
		});
		expect(mockUnlinkSync).toHaveBeenCalledWith(
			expect.stringContaining("lint.md"),
		);
		expect(logOutput).toContain("Removed run configuration: lint");
	});

	it("exits with error when named config does not exist", () => {
		setArgv("missing");
		mockLoadProjectConfig.mockReturnValue({
			run: [{ name: "lint", command: "eslint" }],
		});

		expect(() => remove()).toThrow("process.exit(1)");

		expect(exitCode).toBe(1);
		expect(errorOutput).toContain('Run configuration "missing" not found');
		expect(mockSaveConfig).not.toHaveBeenCalled();
	});

	it("exits with error when run list is empty", () => {
		setArgv("lint");
		mockLoadProjectConfig.mockReturnValue({ run: [] });

		expect(() => remove()).toThrow("process.exit(1)");

		expect(exitCode).toBe(1);
		expect(mockSaveConfig).not.toHaveBeenCalled();
	});

	it("exits with error when run list is undefined", () => {
		setArgv("lint");
		mockLoadProjectConfig.mockReturnValue({});

		expect(() => remove()).toThrow("process.exit(1)");

		expect(exitCode).toBe(1);
		expect(mockSaveConfig).not.toHaveBeenCalled();
	});

	it("skips file deletion when command file does not exist", () => {
		setArgv("test");
		mockLoadProjectConfig.mockReturnValue({
			run: [{ name: "test", command: "vitest" }],
		});
		mockExistsSync.mockReturnValue(false);

		remove();

		expect(mockSaveConfig).toHaveBeenCalledWith({ run: [] });
		expect(mockUnlinkSync).not.toHaveBeenCalled();
		expect(logOutput).toContain("Removed run configuration: test");
	});
});
