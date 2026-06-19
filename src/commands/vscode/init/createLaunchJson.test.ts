import {
	mkdtempSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSettingsJson } from "./createSettingsJson";
import { createExtensionsJson } from "./createExtensionsJson";

describe("createSettingsJson", () => {
	let dir: string;
	let originalCwd: string;

	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		originalCwd = process.cwd();
		dir = mkdtempSync(join(tmpdir(), "assist-vscode-settings-"));
		mkdirSync(join(dir, ".vscode"));
		process.chdir(dir);
	});

	afterEach(() => {
		process.chdir(originalCwd);
		rmSync(dir, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	function readSettings(): Record<string, unknown> {
		return JSON.parse(
			readFileSync(join(dir, ".vscode", "settings.json"), "utf8"),
		);
	}

	it("sets oxc as the default formatter", () => {
		createSettingsJson();

		expect(readSettings()["editor.defaultFormatter"]).toBe("oxc.oxc-vscode");
	});

	it("enables format on save", () => {
		createSettingsJson();

		expect(readSettings()["editor.formatOnSave"]).toBe(true);
	});

	it("writes oxc fix-all and import-organization code actions", () => {
		createSettingsJson();

		expect(readSettings()["editor.codeActionsOnSave"]).toEqual({
			"source.fixAll.oxc": "explicit",
			"source.organizeImports.oxc": "explicit",
		});
	});

	describe("when an existing settings.json references biome", () => {
		beforeEach(() => {
			writeFileSync(
				join(dir, ".vscode", "settings.json"),
				`${JSON.stringify({
					"editor.defaultFormatter": "biomejs.biome",
					"editor.codeActionsOnSave": {
						"source.organizeImports.biome": "explicit",
					},
					"files.eol": "\n",
				})}\n`,
			);
		});

		it("replaces the biome formatter with oxc", () => {
			createSettingsJson();

			expect(readSettings()["editor.defaultFormatter"]).toBe("oxc.oxc-vscode");
		});

		it("strips biome code actions", () => {
			createSettingsJson();

			expect(readSettings()["editor.codeActionsOnSave"]).toEqual({
				"source.fixAll.oxc": "explicit",
				"source.organizeImports.oxc": "explicit",
			});
		});

		it("preserves unrelated existing settings", () => {
			createSettingsJson();

			expect(readSettings()["files.eol"]).toBe("\n");
		});
	});
});

describe("createExtensionsJson", () => {
	let dir: string;
	let originalCwd: string;

	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		originalCwd = process.cwd();
		dir = mkdtempSync(join(tmpdir(), "assist-vscode-extensions-"));
		mkdirSync(join(dir, ".vscode"));
		process.chdir(dir);
	});

	afterEach(() => {
		process.chdir(originalCwd);
		rmSync(dir, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	function readExtensions(): { recommendations: string[] } {
		return JSON.parse(
			readFileSync(join(dir, ".vscode", "extensions.json"), "utf8"),
		);
	}

	it("recommends the oxc extension", () => {
		createExtensionsJson();

		expect(readExtensions().recommendations).toEqual(["oxc.oxc-vscode"]);
	});

	describe("when an existing extensions.json recommends biome", () => {
		beforeEach(() => {
			writeFileSync(
				join(dir, ".vscode", "extensions.json"),
				`${JSON.stringify({
					recommendations: ["biomejs.biome", "ms-azuretools.vscode-docker"],
				})}\n`,
			);
		});

		it("removes the biome recommendation", () => {
			createExtensionsJson();

			expect(readExtensions().recommendations).not.toContain("biomejs.biome");
		});

		it("adds the oxc recommendation", () => {
			createExtensionsJson();

			expect(readExtensions().recommendations).toContain("oxc.oxc-vscode");
		});

		it("preserves unrelated recommendations", () => {
			createExtensionsJson();

			expect(readExtensions().recommendations).toContain(
				"ms-azuretools.vscode-docker",
			);
		});
	});

	describe("when oxc is already recommended", () => {
		beforeEach(() => {
			writeFileSync(
				join(dir, ".vscode", "extensions.json"),
				`${JSON.stringify({ recommendations: ["oxc.oxc-vscode"] })}\n`,
			);
		});

		it("does not duplicate the recommendation", () => {
			createExtensionsJson();

			expect(readExtensions().recommendations).toEqual(["oxc.oxc-vscode"]);
		});
	});
});
