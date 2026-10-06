import { existsSync, unlinkSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { listRepoConfigs } from "../../shared/db/listRepoConfigs";
import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";
import type * as fsMockModule from "../../test/mocks/fsMock";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { seedRepoConfigs } from "../../test/mothers/seedRepoConfigs";
import { remove } from "./remove";

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
const mockExistsSync = vi.mocked(existsSync);
const mockUnlinkSync = vi.mocked(unlinkSync);

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

describe("remove", () => {
	it("removes config and deletes command file when both exist", async () => {
		mockLoadProjectConfig.mockReturnValue({
			run: [
				{ name: "lint", command: "eslint" },
				{ name: "test", command: "vitest" },
			],
		});
		mockExistsSync.mockReturnValue(true);

		await remove("lint");

		expect(mockSaveConfig).toHaveBeenCalledWith({
			run: [{ name: "test", command: "vitest" }],
		});
		expect(mockUnlinkSync).toHaveBeenCalledWith(
			expect.stringContaining("lint.md"),
		);
		expect(logOutput).toContain("Removed run configuration: lint");
	});

	it("exits with error when named config does not exist", async () => {
		mockLoadProjectConfig.mockReturnValue({
			run: [{ name: "lint", command: "eslint" }],
		});

		await expect(remove("missing")).rejects.toThrow("process.exit(1)");

		expect(exitCode).toBe(1);
		expect(errorOutput).toContain('Run configuration "missing" not found');
		expect(mockSaveConfig).not.toHaveBeenCalled();
	});

	it("exits with error when run list is empty", async () => {
		mockLoadProjectConfig.mockReturnValue({ run: [] });

		await expect(remove("lint")).rejects.toThrow("process.exit(1)");

		expect(exitCode).toBe(1);
		expect(mockSaveConfig).not.toHaveBeenCalled();
	});

	it("exits with error when run list is undefined", async () => {
		mockLoadProjectConfig.mockReturnValue({});

		await expect(remove("lint")).rejects.toThrow("process.exit(1)");

		expect(exitCode).toBe(1);
		expect(mockSaveConfig).not.toHaveBeenCalled();
	});

	it("skips file deletion when command file does not exist", async () => {
		mockLoadProjectConfig.mockReturnValue({
			run: [{ name: "test", command: "vitest" }],
		});
		mockExistsSync.mockReturnValue(false);

		await remove("test");

		expect(mockSaveConfig).toHaveBeenCalledWith({ run: [] });
		expect(mockUnlinkSync).not.toHaveBeenCalled();
		expect(logOutput).toContain("Removed run configuration: test");
	});

	describe("with --repo", () => {
		it("removes the entry from the current repo's shared override", async () => {
			await seedRepoConfigs(orm, {
				[ORIGIN]: {
					run: [
						{ name: "ios", command: "npm", server: true },
						{ name: "lint", command: "eslint" },
					],
				},
			});

			await remove("ios", { repo: true });

			expect(await listRepoConfigs(orm)).toEqual({
				[ORIGIN]: { run: [{ name: "lint", command: "eslint" }] },
			});
			expect(mockSaveConfig).not.toHaveBeenCalled();
			expect(mockUnlinkSync).not.toHaveBeenCalled();
			expect(logOutput).toContain(
				`Removed run configuration: ios (repo: ${ORIGIN})`,
			);
		});

		it("removes the entry from a named repo's override", async () => {
			await seedRepoConfigs(orm, {
				other: { run: [{ name: "dev", command: "vite" }] },
			});

			await remove("dev", { repo: "other" });

			expect(await listRepoConfigs(orm)).toEqual({ other: { run: [] } });
		});

		it("exits when the repo override has no such entry", async () => {
			await seedRepoConfigs(orm, {
				[ORIGIN]: { run: [{ name: "lint", command: "eslint" }] },
			});

			await expect(remove("ios", { repo: true })).rejects.toThrow(
				"process.exit(1)",
			);

			expect(errorOutput).toContain(
				`Run configuration "ios" not found in repo ${ORIGIN}`,
			);
		});
	});
});
