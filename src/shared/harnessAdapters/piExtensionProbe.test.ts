import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { harnesses } from "../harnesses";

vi.unmock("./piExtensionProbe");

import { piExtensionProbe } from "./piExtensionProbe";

const originalHome = harnesses.pi.homeDir;

describe("piExtensionProbe", () => {
	beforeEach(() => {
		harnesses.pi.homeDir = mkdtempSync(join(tmpdir(), "pi-probe-"));
	});

	afterEach(() => {
		harnesses.pi.homeDir = originalHome;
	});

	it("is unsupported with a remediation when the extension is missing", () => {
		expect(piExtensionProbe()).toMatchObject({
			supported: false,
			reason: expect.stringContaining("assist-permission-gate.ts"),
			remediation: expect.stringContaining("assist sync"),
		});
	});

	it("is supported once assist sync installed the extension", () => {
		const dir = join(harnesses.pi.homeDir, "extensions");
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, "assist-permission-gate.ts"), "");
		expect(piExtensionProbe()).toEqual({ supported: true });
	});
});
