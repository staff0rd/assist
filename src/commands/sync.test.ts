import { existsSync, readdirSync, readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../shared/loadConfig";
import { makeAssistConfig } from "../test/mothers/makeAssistConfig";
import type * as fsMockModule from "../test/mocks/fsMock";
import type * as loadConfigMockModule from "../test/mocks/loadConfigMock";

const mockSyncSettings = vi.fn();
const mockSyncDesign = vi.fn();
const mockPruneCommands = vi.fn();
const mockPruneSkills = vi.fn();
const mockSyncCodex = vi.fn();
const mockSyncPi = vi.fn();
const mockResolveSyncConflicts = vi.fn();
const mockLoadConfig = vi.mocked(loadConfig);

vi.mock("./sync/syncCodex", () => ({
	syncCodex: (...args: unknown[]) => mockSyncCodex(...args),
}));

vi.mock("./sync/resolveSyncConflicts", () => ({
	resolveSyncConflicts: (...args: unknown[]) =>
		mockResolveSyncConflicts(...args),
}));

vi.mock("./sync/syncPi", () => ({
	syncPi: (...args: unknown[]) => mockSyncPi(...args),
}));

vi.mock("../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

vi.mock("./sync/syncSettings", () => ({
	syncSettings: (...args: unknown[]) => mockSyncSettings(...args),
}));

vi.mock("./sync/syncDesign", () => ({
	syncDesign: (...args: unknown[]) => mockSyncDesign(...args),
}));

vi.mock("./sync/pruneCommands", () => ({
	pruneCommands: (...args: unknown[]) => mockPruneCommands(...args),
}));

vi.mock("./sync/pruneSkills", () => ({
	pruneSkills: (...args: unknown[]) => mockPruneSkills(...args),
}));

vi.mock("node:fs", async () =>
	(await vi.importActual<typeof fsMockModule>("../test/mocks/fsMock")).fsMock(),
);

import { sync } from "./sync";

describe("sync", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(readdirSync).mockReturnValue(["commit.md", "verify.md"] as never);
		vi.mocked(existsSync).mockReturnValue(false);
		vi.mocked(readFileSync).mockReturnValue("");
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ sync: { autoConfirm: false, preferences: false } }),
		);
		const emptyPrune = { orphans: [], removed: [], skipped: [], unmanaged: [] };
		mockPruneCommands.mockReturnValue(emptyPrune);
		mockPruneSkills.mockReturnValue(emptyPrune);
		mockSyncDesign.mockReturnValue([]);
		mockResolveSyncConflicts.mockResolvedValue([]);
	});

	it("should not prune when --prune is not passed", async () => {
		await sync();

		expect(mockPruneCommands).not.toHaveBeenCalled();
		expect(mockPruneSkills).not.toHaveBeenCalled();
	});

	it("should prune the claude skills dir against the synced command names", async () => {
		await sync({ prune: true });

		expect(mockPruneSkills).toHaveBeenCalledWith(
			expect.stringContaining("skills"),
			["commit", "verify"],
			{ force: false, owner: expect.anything() },
		);
	});

	it("should keep the skill directories synced from agent/skills", async () => {
		mockSyncDesign.mockReturnValue(["deploy-flow"]);

		await sync({ prune: true });

		expect(mockPruneSkills).toHaveBeenCalledWith(
			expect.stringContaining("skills"),
			["commit", "verify", "deploy-flow"],
			{ force: false, owner: expect.anything() },
		);
	});

	it("should compare only against the source .md names", async () => {
		vi.mocked(readdirSync).mockReturnValueOnce([
			"commit.md",
			"notes.txt",
		] as never);

		await sync({ prune: true });

		expect(mockPruneSkills).toHaveBeenCalledWith(
			expect.stringContaining("skills"),
			["commit"],
			{ force: false, owner: expect.anything() },
		);
	});

	it("should treat every claude command file as unwritten by sync", async () => {
		await sync({ prune: true });

		expect(mockPruneCommands).toHaveBeenCalledWith(
			expect.stringContaining("commands"),
			[],
			{ force: false, owner: expect.anything() },
		);
	});

	it("should forward --force to the prunes", async () => {
		await sync({ prune: true, force: true });

		expect(mockPruneSkills).toHaveBeenCalledWith(
			expect.stringContaining("skills"),
			["commit", "verify"],
			{ force: true, owner: expect.anything() },
		);
		expect(mockPruneCommands).toHaveBeenCalledWith(
			expect.stringContaining("commands"),
			[],
			{ force: true, owner: expect.anything() },
		);
	});

	it("should forward the prune flags to the codex and pi syncs", async () => {
		await sync({ prune: true, force: true });

		expect(mockSyncCodex).toHaveBeenCalledWith(
			expect.any(String),
			expect.anything(),
			{
				prune: true,
				force: true,
			},
		);
		expect(mockSyncPi).toHaveBeenCalledWith(
			expect.any(String),
			expect.anything(),
			{
				prune: true,
				force: true,
			},
		);
	});

	it("should tell the codex and pi syncs not to prune by default", async () => {
		await sync();

		expect(mockSyncCodex).toHaveBeenCalledWith(
			expect.any(String),
			expect.anything(),
			{
				prune: undefined,
				force: undefined,
			},
		);
		expect(mockSyncPi).toHaveBeenCalledWith(
			expect.any(String),
			expect.anything(),
			{
				prune: undefined,
				force: undefined,
			},
		);
	});

	it("should pass yes=false when autoConfirm is false and no --yes flag", async () => {
		await sync();

		expect(mockSyncSettings).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			{ yes: false, preferences: false },
		);
	});

	it("should pass yes=true when autoConfirm is true", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ sync: { autoConfirm: true, preferences: false } }),
		);

		await sync();

		expect(mockSyncSettings).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			{ yes: true, preferences: false },
		);
	});

	it("should prefer explicit --yes flag over config", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ sync: { autoConfirm: false, preferences: false } }),
		);

		await sync({ yes: true });

		expect(mockSyncSettings).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			{ yes: true, preferences: false },
		);
	});

	it("should use autoConfirm when --yes is not provided", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ sync: { autoConfirm: true, preferences: false } }),
		);

		await sync({});

		expect(mockSyncSettings).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			{ yes: true, preferences: false },
		);
	});

	it("passes sync.preferences through to syncSettings", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ sync: { autoConfirm: false, preferences: true } }),
		);

		await sync();

		expect(mockSyncSettings).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			{ yes: false, preferences: true },
		);
	});

	it("still offers to overwrite unowned files when autoConfirm is true", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ sync: { autoConfirm: true, preferences: false } }),
		);

		await sync();

		expect(mockResolveSyncConflicts).toHaveBeenCalledWith(
			expect.any(Array),
			false,
		);
	});

	it("leaves unowned files in place with an explicit --yes", async () => {
		await sync({ yes: true });

		expect(mockResolveSyncConflicts).toHaveBeenCalledWith(
			expect.any(Array),
			true,
		);
	});
});
