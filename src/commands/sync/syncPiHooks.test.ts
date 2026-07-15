import * as path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockMkdirSync = vi.fn();
const mockCopyFileSync = vi.fn();

vi.mock("node:fs", () => ({
	mkdirSync: (...args: unknown[]) => mockMkdirSync(...args),
	copyFileSync: (...args: unknown[]) => mockCopyFileSync(...args),
}));

import { harnesses } from "../../shared/harnesses";
import {
	PI_PERMISSION_GATE_FILE,
	piPermissionGateTarget,
	syncPiHooks,
} from "./syncPiHooks";

describe("syncPiHooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("copies the extension source into ~/.pi/agent/extensions", () => {
		const source = "/repo/pi/permission-gate.ts";
		syncPiHooks(source);

		const target = path.join(
			harnesses.pi.homeDir,
			"extensions",
			PI_PERMISSION_GATE_FILE,
		);
		expect(mockMkdirSync).toHaveBeenCalledWith(path.dirname(target), {
			recursive: true,
		});
		expect(mockCopyFileSync).toHaveBeenCalledWith(source, target);
	});

	it("targets the pi harness home dir", () => {
		expect(piPermissionGateTarget()).toBe(
			path.join(harnesses.pi.homeDir, "extensions", PI_PERMISSION_GATE_FILE),
		);
	});
});
