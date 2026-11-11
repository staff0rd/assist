import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfigFrom } from "../shared/loadConfigFrom";
import { writeRepoConfigCache } from "../shared/writeRepoConfigCache";

const mockSyncSettings = vi.fn();
let cwd: string;

vi.mock("../shared/loadConfig", () => ({
	loadConfig: () => loadConfigFrom(cwd, join(cwd, "global.yml")),
}));
vi.mock("./sync/syncSettings", () => ({
	syncSettings: (...args: unknown[]) => mockSyncSettings(...args),
}));
vi.mock("./sync/createSyncFiles", () => ({
	createSyncFiles: () => ({ finish: vi.fn() }),
}));
vi.mock("./sync/syncManifest", () => ({ syncManifest: { load: () => [] } }));
vi.mock("./sync/retiredOwnedPaths", () => ({ retiredOwnedPaths: () => [] }));
vi.mock("./sync/syncClaudeCommands", () => ({ syncClaudeCommands: () => [] }));
vi.mock("./sync/syncDesign", () => ({ syncDesign: () => [] }));
vi.mock("./sync/syncCodex", () => ({ syncCodex: vi.fn() }));
vi.mock("./sync/syncPi", () => ({ syncPi: vi.fn() }));
vi.mock("./sync/reportRetiredAgentsFiles", () => ({
	reportRetiredAgentsFiles: vi.fn(),
}));
vi.mock("./sync/pruneClaude", () => ({ pruneClaude: vi.fn() }));

import { sync } from "./sync";

describe("sync with sync.* in user (db)", () => {
	beforeEach(() => {
		mockSyncSettings.mockReset();
		cwd = mkdtempSync(join(tmpdir(), "sync-user-db-"));
		writeFileSync(join(cwd, "global.yml"), "");
	});

	afterEach(() => {
		writeRepoConfigCache({});
		rmSync(cwd, { recursive: true, force: true });
	});

	it("honours autoConfirm and preferences set only in user (db)", async () => {
		writeRepoConfigCache(
			{},
			{ sync: { autoConfirm: true, preferences: true } },
		);

		await sync();

		expect(mockSyncSettings).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			{ yes: true, preferences: true },
		);
	});

	it("lets user (node) override user (db)", async () => {
		writeRepoConfigCache({}, { sync: { autoConfirm: true } });
		writeFileSync(join(cwd, "global.yml"), "sync:\n  autoConfirm: false\n");

		await sync();

		expect(mockSyncSettings).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			{ yes: false, preferences: false },
		);
	});
});
