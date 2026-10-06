import { mkdirSync, writeFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { listRepoConfigs } from "../../shared/db/listRepoConfigs";
import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";
import type * as fsMockModule from "../../test/mocks/fsMock";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { seedRepoConfigs } from "../../test/mothers/seedRepoConfigs";
import { add } from "./add";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../test/mocks/fsMock")
	).fsMock(),
);

vi.mock("../../shared/refreshRepoConfigCache", () => ({
	refreshRepoConfigCache: () => Promise.resolve(0),
}));

vi.mock("../backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: () => ORIGIN,
}));

let orm: Db;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

const ORIGIN = "github.com/org/assist";
const mockLoadProjectConfig = vi.mocked(loadProjectConfig);
const mockSaveConfig = vi.mocked(saveConfig);
const mockMkdirSync = vi.mocked(mkdirSync);
const mockWriteFileSync = vi.mocked(writeFileSync);

let exitCode: number | undefined;
let errorOutput: string[];
let logOutput: string[];

beforeEach(async () => {
	({ orm } = await createTestDb());
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

function savedRun(): unknown {
	return mockSaveConfig.mock.calls[0][0].run;
}

describe("add", () => {
	it("creates a slash command file for plain names", async () => {
		setArgv("lint", "eslint");
		mockLoadProjectConfig.mockReturnValue({});

		await add();

		expect(mockSaveConfig).toHaveBeenCalled();
		expect(mockWriteFileSync).toHaveBeenCalledWith(
			expect.stringContaining("lint.md"),
			expect.any(String),
		);
	});

	it("creates a slash command file for test: prefixed names", async () => {
		setArgv("test:unit", "vitest");
		mockLoadProjectConfig.mockReturnValue({});

		await add();

		expect(mockSaveConfig).toHaveBeenCalled();
		expect(mockWriteFileSync).toHaveBeenCalledWith(
			expect.stringContaining("test:unit.md"),
			expect.any(String),
		);
	});

	it("skips slash command file for verify: prefixed names", async () => {
		setArgv("verify:lint", "eslint");
		mockLoadProjectConfig.mockReturnValue({});

		await add();

		expect(mockSaveConfig).toHaveBeenCalled();
		expect(mockWriteFileSync).not.toHaveBeenCalled();
		expect(mockMkdirSync).not.toHaveBeenCalled();
		expect(logOutput).toContain(
			"Added run configuration: verify:lint -> eslint",
		);
	});

	it("exits with error when name already exists", async () => {
		setArgv("lint", "eslint");
		mockLoadProjectConfig.mockReturnValue({
			run: [{ name: "lint", command: "eslint" }],
		});

		await expect(add()).rejects.toThrow("process.exit(1)");

		expect(exitCode).toBe(1);
		expect(mockSaveConfig).not.toHaveBeenCalled();
		expect(mockWriteFileSync).not.toHaveBeenCalled();
	});

	it("writes a bare --server as true with a port", async () => {
		setArgv("dev", "npm", "run", "dev", "--server", "--port", "3000");
		mockLoadProjectConfig.mockReturnValue({});

		await add();

		expect(savedRun()).toEqual([
			{
				name: "dev",
				command: "npm",
				args: ["run", "dev"],
				server: true,
				port: 3000,
			},
		]);
	});

	it("writes a --server group name", async () => {
		setArgv("api", "npm", "start", "--server", "api");
		mockLoadProjectConfig.mockReturnValue({});

		await add();

		expect(savedRun()).toEqual([
			{ name: "api", command: "npm", args: ["start"], server: "api" },
		]);
	});

	it("rejects a non-numeric --port", async () => {
		setArgv("dev", "vite", "--port", "abc");
		mockLoadProjectConfig.mockReturnValue({});

		await expect(add()).rejects.toThrow("process.exit(1)");

		expect(mockSaveConfig).not.toHaveBeenCalled();
	});

	describe("with --repo", () => {
		it("writes the current repo's shared override without a command file", async () => {
			setArgv("dev", "vite", "--server", "--repo");

			await add();

			expect(await listRepoConfigs(orm)).toEqual({
				[ORIGIN]: { run: [{ name: "dev", command: "vite", server: true }] },
			});
			expect(mockSaveConfig).not.toHaveBeenCalled();
			expect(mockWriteFileSync).not.toHaveBeenCalled();
		});

		it("appends to a named repo's existing run list", async () => {
			await seedRepoConfigs(orm, {
				other: { run: [{ name: "lint", command: "eslint" }] },
			});
			setArgv("dev", "vite", "--repo", "other");

			await add();

			expect(await listRepoConfigs(orm)).toEqual({
				other: {
					run: [
						{ name: "lint", command: "eslint" },
						{ name: "dev", command: "vite" },
					],
				},
			});
		});

		it("exits when the repo override already has the name", async () => {
			await seedRepoConfigs(orm, {
				[ORIGIN]: { run: [{ name: "dev", command: "vite" }] },
			});
			setArgv("dev", "next", "--repo");

			await expect(add()).rejects.toThrow("process.exit(1)");

			expect(errorOutput).toContain(
				'Run configuration with name "dev" already exists',
			);
		});
	});
});
