import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
import { init } from "./init";
import oxfmtTemplate from "./oxfmtrc.template.json";

vi.mock("../../shared/promptConfirm", () => ({ promptConfirm: vi.fn() }));

const promptConfirmMock = promptConfirm as unknown as Mock;

const expectedConfig = `${JSON.stringify(oxfmtTemplate, null, "\t")}\n`;

describe("format init", () => {
	let dir: string;
	let originalCwd: string;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "log").mockImplementation(() => {});
		originalCwd = process.cwd();
		dir = mkdtempSync(join(tmpdir(), "assist-format-init-"));
		process.chdir(dir);
	});

	afterEach(() => {
		process.chdir(originalCwd);
		rmSync(dir, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	it("writes the baseline .oxfmtrc.json", async () => {
		await init();

		expect(readFileSync(join(dir, ".oxfmtrc.json"), "utf8")).toBe(
			expectedConfig,
		);
	});

	it("enables import sorting", async () => {
		await init();

		expect(oxfmtTemplate.sortImports).toBe(true);
	});

	describe("when an .oxfmtrc.json already matches the baseline", () => {
		beforeEach(() => {
			writeFileSync(join(dir, ".oxfmtrc.json"), expectedConfig);
		});

		it("leaves it unchanged without prompting", async () => {
			await init();

			expect(promptConfirmMock).not.toHaveBeenCalled();
			expect(readFileSync(join(dir, ".oxfmtrc.json"), "utf8")).toBe(
				expectedConfig,
			);
		});
	});

	describe("when an .oxfmtrc.json differs and the user declines the update", () => {
		const existing = '{\n\t"custom": true\n}\n';

		beforeEach(() => {
			writeFileSync(join(dir, ".oxfmtrc.json"), existing);
			promptConfirmMock.mockResolvedValue(false);
		});

		it("keeps the existing config", async () => {
			await init();

			expect(readFileSync(join(dir, ".oxfmtrc.json"), "utf8")).toBe(existing);
		});
	});

	describe("when an .oxfmtrc.json differs and the user accepts the update", () => {
		beforeEach(() => {
			writeFileSync(join(dir, ".oxfmtrc.json"), '{\n\t"custom": true\n}\n');
			promptConfirmMock.mockResolvedValue(true);
		});

		it("overwrites it with the baseline config", async () => {
			await init();

			expect(readFileSync(join(dir, ".oxfmtrc.json"), "utf8")).toBe(
				expectedConfig,
			);
		});
	});
});
