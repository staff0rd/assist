import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parse as parseYaml } from "yaml";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { readUserConfig } from "../../shared/db/readUserConfig";
import { updateUserConfig } from "../../shared/db/updateUserConfig";
import { readUserConfigCache } from "../../shared/readUserConfigCache";
import { addUserRule } from "./addUserRule";

let orm: Db;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

describe("addUserRule", () => {
	let dir: string;
	let globalConfigPath: string;

	beforeEach(async () => {
		({ orm } = await createTestDb());
		dir = mkdtempSync(join(tmpdir(), "add-user-rule-"));
		globalConfigPath = join(dir, ".assist.yml");
		vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
		process.exitCode = undefined;
		vi.restoreAllMocks();
	});

	function readGlobal(): Record<string, unknown> {
		return parseYaml(readFileSync(globalConfigPath, "utf8"));
	}

	describe("--node", () => {
		it("appends to advice.rules after the existing entries", async () => {
			writeFileSync(
				globalConfigPath,
				"advice:\n  extra: Be brief\n  rules:\n    - title: First\n      text: Existing rule\n",
			);

			await addUserRule(
				"Give the direct URL",
				{ title: "Link, don't navigate", node: true },
				globalConfigPath,
			);

			expect(readGlobal()).toEqual({
				advice: {
					extra: "Be brief",
					rules: [
						{ title: "First", text: "Existing rule" },
						{ title: "Link, don't navigate", text: "Give the direct URL" },
					],
				},
			});
		});

		it("creates advice.rules when ~/.assist.yml has none", async () => {
			await addUserRule(
				"Give the direct URL",
				{ title: "Links", node: true },
				globalConfigPath,
			);

			expect(readGlobal()).toEqual({
				advice: { rules: [{ title: "Links", text: "Give the direct URL" }] },
			});
		});
	});

	describe("--user", () => {
		it("appends to advice.rules in user (db) and refreshes the cache", async () => {
			await updateUserConfig(orm, () => ({
				ok: true,
				config: {
					commit: { push: true },
					advice: { rules: [{ title: "First", text: "Existing rule" }] },
				},
				result: undefined,
			}));

			await addUserRule(
				"Give the direct URL",
				{ title: "Links", user: true },
				globalConfigPath,
			);

			const expected = {
				commit: { push: true },
				advice: {
					rules: [
						{ title: "First", text: "Existing rule" },
						{ title: "Links", text: "Give the direct URL" },
					],
				},
			};
			expect(await readUserConfig(orm)).toEqual(expected);
			expect(readUserConfigCache()).toEqual(expected);
			expect(() => readFileSync(globalConfigPath)).toThrow();
		});
	});

	it.each([
		[{ title: "Links", user: true, scope: "." }],
		[{ title: "Links", node: true, scope: "." }],
		[{ title: "Links", user: true, node: true }],
		[{ user: true }],
		[{ node: true }],
	])("rejects %o without writing", async (options) => {
		await addUserRule("Give the direct URL", options, globalConfigPath);

		expect(process.exitCode).toBe(1);
		expect(() => readFileSync(globalConfigPath)).toThrow();
		expect(await readUserConfig(orm)).toEqual({});
	});
});
