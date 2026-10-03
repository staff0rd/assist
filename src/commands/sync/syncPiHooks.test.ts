import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import * as path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../test/mocks/fsMock";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../test/mocks/fsMock")
	).fsMock(),
);

const mockMkdirSync = vi.mocked(mkdirSync);
const mockCopyFileSync = vi.mocked(copyFileSync);
const mockReaddirSync = vi.mocked(readdirSync);

import { harnesses } from "../../shared/harnesses";
import { piExtensionsDir, syncPiHooks } from "./syncPiHooks";

describe("syncPiHooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockReaddirSync.mockReturnValue([
			"permission-gate.ts",
			"status-driver.ts",
			"README.md",
		] as never);
	});

	it("copies every .ts extension into ~/.pi/agent/extensions, namespaced with assist-", () => {
		const source = "/repo/pi";
		syncPiHooks(source);

		const dir = piExtensionsDir();
		expect(mockMkdirSync).toHaveBeenCalledWith(dir, { recursive: true });
		expect(mockCopyFileSync).toHaveBeenCalledWith(
			path.join(source, "permission-gate.ts"),
			path.join(dir, "assist-permission-gate.ts"),
		);
		expect(mockCopyFileSync).toHaveBeenCalledWith(
			path.join(source, "status-driver.ts"),
			path.join(dir, "assist-status-driver.ts"),
		);
	});

	it("ignores non-.ts files", () => {
		syncPiHooks("/repo/pi");
		expect(mockCopyFileSync).not.toHaveBeenCalledWith(
			expect.anything(),
			path.join(piExtensionsDir(), "assist-README.md"),
		);
	});

	it("targets the pi harness extensions dir", () => {
		expect(piExtensionsDir()).toBe(
			path.join(harnesses.pi.homeDir, "extensions"),
		);
	});
});
