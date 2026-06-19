import { execSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import { promptConfirm } from "../../shared/promptConfirm";
import { removeEslint } from "../../shared/removeEslint";
import { init } from "./init";
import oxlintTemplate from "./oxlintrc.template.json";

vi.mock("node:child_process", () => ({ execSync: vi.fn() }));
vi.mock("../../shared/removeEslint", () => ({ removeEslint: vi.fn() }));
vi.mock("../../shared/promptConfirm", () => ({ promptConfirm: vi.fn() }));

const execSyncMock = execSync as unknown as Mock;
const promptConfirmMock = promptConfirm as unknown as Mock;

const expectedConfig = `${JSON.stringify(oxlintTemplate, null, "\t")}\n`;

describe("lint init", () => {
	let dir: string;
	let originalCwd: string;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "log").mockImplementation(() => {});
		originalCwd = process.cwd();
		dir = mkdtempSync(join(tmpdir(), "assist-lint-init-"));
		process.chdir(dir);
	});

	afterEach(() => {
		process.chdir(originalCwd);
		rmSync(dir, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	it("writes the baseline .oxlintrc.json", async () => {
		await init();

		expect(readFileSync(join(dir, ".oxlintrc.json"), "utf8")).toBe(
			expectedConfig,
		);
	});

	it("removes ESLint config first", async () => {
		await init();

		expect(removeEslint).toHaveBeenCalled();
	});

	describe("when a biome.json exists", () => {
		beforeEach(() => {
			writeFileSync(join(dir, "biome.json"), "{}\n");
		});

		it("removes it", async () => {
			await init();

			expect(existsSync(join(dir, "biome.json"))).toBe(false);
		});
	});

	describe("when @biomejs/biome is installed", () => {
		beforeEach(() => {
			writeFileSync(
				join(dir, "package.json"),
				`${JSON.stringify({ devDependencies: { "@biomejs/biome": "^1.0.0" } })}\n`,
			);
		});

		it("uninstalls it", async () => {
			await init();

			expect(execSyncMock).toHaveBeenCalledWith(
				"npm uninstall @biomejs/biome",
				expect.anything(),
			);
		});
	});

	describe("when @biomejs/biome is not installed", () => {
		beforeEach(() => {
			writeFileSync(
				join(dir, "package.json"),
				`${JSON.stringify({ devDependencies: {} })}\n`,
			);
		});

		it("does not run npm uninstall", async () => {
			await init();

			expect(execSyncMock).not.toHaveBeenCalled();
		});
	});

	describe("when an .oxlintrc.json already matches the baseline", () => {
		beforeEach(() => {
			writeFileSync(join(dir, ".oxlintrc.json"), expectedConfig);
		});

		it("leaves it unchanged without prompting", async () => {
			await init();

			expect(promptConfirmMock).not.toHaveBeenCalled();
			expect(readFileSync(join(dir, ".oxlintrc.json"), "utf8")).toBe(
				expectedConfig,
			);
		});
	});

	describe("when an .oxlintrc.json differs and the user declines the update", () => {
		const existing = '{\n\t"custom": true\n}\n';

		beforeEach(() => {
			writeFileSync(join(dir, ".oxlintrc.json"), existing);
			promptConfirmMock.mockResolvedValue(false);
		});

		it("keeps the existing config", async () => {
			await init();

			expect(readFileSync(join(dir, ".oxlintrc.json"), "utf8")).toBe(existing);
		});
	});

	describe("when an .oxlintrc.json differs and the user accepts the update", () => {
		beforeEach(() => {
			writeFileSync(join(dir, ".oxlintrc.json"), '{\n\t"custom": true\n}\n');
			promptConfirmMock.mockResolvedValue(true);
		});

		it("overwrites it with the baseline config", async () => {
			await init();

			expect(readFileSync(join(dir, ".oxlintrc.json"), "utf8")).toBe(
				expectedConfig,
			);
		});
	});
});
