import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSyncSettings = vi.fn();
const mockSyncClaudeMd = vi.fn();
const mockSyncDesign = vi.fn();
const mockLoadConfig = vi.fn();

vi.mock("../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

vi.mock("./sync/syncSettings", () => ({
	syncSettings: (...args: unknown[]) => mockSyncSettings(...args),
}));

vi.mock("./sync/syncClaudeMd", () => ({
	syncClaudeMd: (...args: unknown[]) => mockSyncClaudeMd(...args),
}));

vi.mock("./sync/syncDesign", () => ({
	syncDesign: (...args: unknown[]) => mockSyncDesign(...args),
}));

vi.mock("node:fs", () => ({
	mkdirSync: vi.fn(),
	readdirSync: vi.fn(() => []),
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
	});

	it("should pass yes=false when autoConfirm is false and no --yes flag", async () => {
		await sync();

		expect(mockSyncSettings).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			{ yes: false },
		);
		expect(mockSyncClaudeMd).toHaveBeenCalledWith(
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
		expect(mockSyncClaudeMd).toHaveBeenCalledWith(
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
