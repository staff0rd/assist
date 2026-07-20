import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findTsConfig } from "./findTsConfig";

describe("findTsConfig", () => {
	let dir: string;
	let originalCwd: string;

	function write(relativePath: string, content: string) {
		const absolute = path.join(dir, relativePath);
		mkdirSync(path.dirname(absolute), { recursive: true });
		writeFileSync(absolute, content);
		return absolute;
	}

	beforeEach(() => {
		originalCwd = process.cwd();
		dir = mkdtempSync(path.join(tmpdir(), "assist-find-tsconfig-"));
		process.chdir(dir);
	});

	afterEach(() => {
		process.chdir(originalCwd);
		rmSync(dir, { recursive: true, force: true });
	});

	describe("when the file lives in a nested sub-project", () => {
		it("resolves the nearest enclosing tsconfig", () => {
			write("tsconfig.json", JSON.stringify({ include: ["src/**/*.ts"] }));
			write("src/root.ts", "export const root = 1;\n");
			const nestedConfig = write(
				"admin/tsconfig.json",
				JSON.stringify({ include: ["src/**/*.ts"] }),
			);
			const source = write(
				"admin/src/pages/usageFormat.ts",
				"export const format = 1;\n",
			);

			expect(findTsConfig(source)).toBe(nestedConfig);
		});
	});

	describe("when the file lives in the root project", () => {
		it("resolves the root tsconfig", () => {
			const rootConfig = write(
				"tsconfig.json",
				JSON.stringify({ include: ["src/**/*.ts"] }),
			);
			const source = write("src/root.ts", "export const root = 1;\n");

			expect(findTsConfig(source)).toBe(rootConfig);
		});
	});
});
