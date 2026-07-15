import * as path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockMkdirSync = vi.fn();
const mockCopyFileSync = vi.fn();
const mockReaddirSync = vi.fn();

vi.mock("node:fs", () => ({
	mkdirSync: (...args: unknown[]) => mockMkdirSync(...args),
	copyFileSync: (...args: unknown[]) => mockCopyFileSync(...args),
	readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
}));

import { harnesses } from "../../shared/harnesses";
import { piExtensionsDir, syncPiHooks } from "./syncPiHooks";

describe("syncPiHooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockReaddirSync.mockReturnValue([
			"permission-gate.ts",
			"status-driver.ts",
			"README.md",
		]);
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
