import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectVscodeSetup } from "./detectVscodeSetup";
import { getAvailableOptions } from "./getAvailableOptions";

describe("vscode init settings option", () => {
	let dir: string;
	let originalCwd: string;

	beforeEach(() => {
		originalCwd = process.cwd();
		dir = mkdtempSync(join(tmpdir(), "assist-vscode-options-"));
		mkdirSync(join(dir, ".vscode"));
		process.chdir(dir);
	});

	afterEach(() => {
		process.chdir(originalCwd);
		rmSync(dir, { recursive: true, force: true });
	});

	function settingsOption() {
		const setup = detectVscodeSetup({});
		return getAvailableOptions(setup).find((o) => o.value === "settings");
	}

	describe("when no settings.json exists", () => {
		it("offers the oxc formatter configuration", () => {
			expect(settingsOption()?.description).toBe("oxc formatter configuration");
		});
	});

	describe("when an oxc settings.json already exists", () => {
		beforeEach(() => {
			writeFileSync(
				join(dir, ".vscode", "settings.json"),
				`${JSON.stringify({ "editor.defaultFormatter": "oxc.oxc-vscode" })}\n`,
			);
		});

		it("does not offer the settings configuration", () => {
			expect(settingsOption()).toBeUndefined();
		});
	});
});
