import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadProjectConfig = vi.fn<() => Record<string, unknown>>();
const mockSaveConfig = vi.fn();

vi.mock("../../shared/loadConfig", () => ({
	loadProjectConfig: () => mockLoadProjectConfig(),
	saveConfig: (c: unknown) => mockSaveConfig(c),
}));

const mockMkdirSync = vi.fn();
const mockWriteFileSync = vi.fn();

vi.mock("node:fs", () => ({
	mkdirSync: (p: string, opts: unknown) => mockMkdirSync(p, opts),
	writeFileSync: (p: string, c: string) => mockWriteFileSync(p, c),
}));

import { add } from "./add";

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

function setArgv(name: string, command: string, ...args: string[]): void {
	process.argv = ["node", "assist", "run", "add", name, command, ...args];
}

describe("add", () => {
	it("creates a slash command file for plain names", () => {
		setArgv("lint", "eslint");
		mockLoadProjectConfig.mockReturnValue({});

		add();

		expect(mockSaveConfig).toHaveBeenCalled();
		expect(mockWriteFileSync).toHaveBeenCalledWith(
			expect.stringContaining("lint.md"),
			expect.any(String),
		);
	});

	it("creates a slash command file for test: prefixed names", () => {
		setArgv("test:unit", "vitest");
		mockLoadProjectConfig.mockReturnValue({});

		add();

		expect(mockSaveConfig).toHaveBeenCalled();
		expect(mockWriteFileSync).toHaveBeenCalledWith(
			expect.stringContaining("test:unit.md"),
			expect.any(String),
		);
	});

	it("skips slash command file for verify: prefixed names", () => {
		setArgv("verify:lint", "eslint");
		mockLoadProjectConfig.mockReturnValue({});

		add();

		expect(mockSaveConfig).toHaveBeenCalled();
		expect(mockWriteFileSync).not.toHaveBeenCalled();
		expect(mockMkdirSync).not.toHaveBeenCalled();
		expect(logOutput).toContain(
			"Added run configuration: verify:lint -> eslint",
		);
	});

	it("exits with error when name already exists", () => {
		setArgv("lint", "eslint");
		mockLoadProjectConfig.mockReturnValue({
			run: [{ name: "lint", command: "eslint" }],
		});

		expect(() => add()).toThrow("process.exit(1)");

		expect(exitCode).toBe(1);
		expect(mockSaveConfig).not.toHaveBeenCalled();
		expect(mockWriteFileSync).not.toHaveBeenCalled();
	});
});
