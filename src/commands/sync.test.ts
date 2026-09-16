import * as fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSyncSettings = vi.fn();
const mockSyncDesign = vi.fn();
const mockPruneCommands = vi.fn();
const mockSyncCodex = vi.fn();
const mockSyncPi = vi.fn();
const mockLoadConfig = vi.fn();

vi.mock("./sync/syncCodex", () => ({
	syncCodex: (...args: unknown[]) => mockSyncCodex(...args),
}));

vi.mock("./sync/syncPi", () => ({
	syncPi: (...args: unknown[]) => mockSyncPi(...args),
}));

vi.mock("../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

vi.mock("./sync/syncSettings", () => ({
	syncSettings: (...args: unknown[]) => mockSyncSettings(...args),
}));

vi.mock("./sync/syncDesign", () => ({
	syncDesign: (...args: unknown[]) => mockSyncDesign(...args),
}));

vi.mock("./sync/pruneCommands", () => ({
	pruneCommands: (...args: unknown[]) => mockPruneCommands(...args),
}));

vi.mock("node:fs", () => ({
	mkdirSync: vi.fn(),
	readdirSync: vi.fn(() => ["commit.md", "verify.md"]),
	copyFileSync: vi.fn(),
	existsSync: vi.fn(() => false),
	readFileSync: vi.fn(() => ""),
	writeFileSync: vi.fn(),
}));

import { sync } from "./sync";

describe("sync", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadConfig.mockReturnValue({ sync: { autoConfirm: false } });
		mockPruneCommands.mockReturnValue({
			orphans: [],
			removed: [],
			skipped: [],
			unmanaged: [],
		});
	});

	it("should not prune when --prune is not passed", async () => {
		await sync();

		expect(mockPruneCommands).not.toHaveBeenCalled();
	});

	it("should prune the claude commands dir against the synced command names", async () => {
		await sync({ prune: true });

		expect(mockPruneCommands).toHaveBeenCalledWith(
			expect.stringContaining("commands"),
			["commit", "verify"],
			{ force: false },
		);
	});

	it("should compare only against the source .md names", async () => {
		vi.mocked(fs.readdirSync).mockReturnValueOnce([
			"commit.md",
			"notes.txt",
		] as unknown as ReturnType<typeof fs.readdirSync>);

		await sync({ prune: true });

		expect(mockPruneCommands).toHaveBeenCalledWith(
			expect.stringContaining("commands"),
			["commit"],
			{ force: false },
		);
	});

	it("should forward --force to the prune", async () => {
		await sync({ prune: true, force: true });

		expect(mockPruneCommands).toHaveBeenCalledWith(
			expect.stringContaining("commands"),
			["commit", "verify"],
			{ force: true },
		);
	});

	it("should forward the prune flags to the codex and pi syncs", async () => {
		await sync({ prune: true, force: true });

		expect(mockSyncCodex).toHaveBeenCalledWith(expect.any(String), {
			prune: true,
			force: true,
		});
		expect(mockSyncPi).toHaveBeenCalledWith(expect.any(String), {
			prune: true,
			force: true,
		});
	});

	it("should tell the codex and pi syncs not to prune by default", async () => {
		await sync();

		expect(mockSyncCodex).toHaveBeenCalledWith(expect.any(String), {
			prune: undefined,
			force: undefined,
		});
		expect(mockSyncPi).toHaveBeenCalledWith(expect.any(String), {
			prune: undefined,
			force: undefined,
		});
	});

	it("should pass yes=false when autoConfirm is false and no --yes flag", async () => {
		await sync();

		expect(mockSyncSettings).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			{ yes: false },
		);
	});

	it("should pass yes=true when autoConfirm is true", async () => {
		mockLoadConfig.mockReturnValue({ sync: { autoConfirm: true } });

		await sync();

		expect(mockSyncSettings).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			{ yes: true },
		);
	});

	it("should prefer explicit --yes flag over config", async () => {
		mockLoadConfig.mockReturnValue({ sync: { autoConfirm: false } });

		await sync({ yes: true });

		expect(mockSyncSettings).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			{ yes: true },
		);
	});

	it("should use autoConfirm when --yes is not provided", async () => {
		mockLoadConfig.mockReturnValue({ sync: { autoConfirm: true } });

		await sync({});

		expect(mockSyncSettings).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			{ yes: true },
		);
	});
});
