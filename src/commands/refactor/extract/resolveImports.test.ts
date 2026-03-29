import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { collectDependencies } from "./collectDependencies";
import { findFunction } from "./findFunction";
import { resolveImports } from "./resolveImports";

function createSourceFile(code: string) {
	const project = new Project({ useInMemoryFileSystem: true });
	return project.createSourceFile("test.ts", code);
}

function requireFunction(
	sf: ReturnType<typeof createSourceFile>,
	name: string,
) {
	const fn = findFunction(sf, name);
	if (!fn) throw new Error(`Expected function "${name}" to exist`);
	return fn;
}

describe("resolveImports", () => {
	describe("when the target function uses an import", () => {
		it("should include that import", () => {
			const sf = createSourceFile(`
				import { join } from "node:path";
				function buildPath() { return join("a", "b"); }
			`);
			const fn = requireFunction(sf, "buildPath");

			const imports = resolveImports(fn, [], sf);

			expect(imports).toHaveLength(1);
			expect(imports[0].moduleSpecifier).toBe("node:path");
			expect(imports[0].namedImports).toEqual(["join"]);
		});
	});

	describe("when an import is unused by extracted functions", () => {
		it("should exclude it", () => {
			const sf = createSourceFile(`
				import { join } from "node:path";
				import { readFile } from "node:fs";
				function buildPath() { return join("a", "b"); }
			`);
			const fn = requireFunction(sf, "buildPath");

			const imports = resolveImports(fn, [], sf);

			expect(imports).toHaveLength(1);
			expect(imports[0].moduleSpecifier).toBe("node:path");
		});
	});

	describe("when a dependency uses an import", () => {
		it("should include it", () => {
			const sf = createSourceFile(`
				import chalk from "chalk";
				function format(msg: string) { return chalk.green(msg); }
				function main() { return format("ok"); }
			`);
			const fn = requireFunction(sf, "main");
			const { functions: deps } = collectDependencies(fn, sf);

			const imports = resolveImports(fn, deps, sf);

			expect(imports).toHaveLength(1);
			expect(imports[0].defaultImport).toBe("chalk");
		});
	});

	describe("when the import is type-only", () => {
		it("should preserve the type-only flag", () => {
			const sf = createSourceFile(`
				import type { Foo } from "./types";
				function useFoo(x: Foo) { return x; }
			`);
			const fn = requireFunction(sf, "useFoo");

			const imports = resolveImports(fn, [], sf);

			expect(imports).toHaveLength(1);
			expect(imports[0].isTypeOnly).toBe(true);
		});
	});

	describe("when a multi-import has partially used names", () => {
		it("should include only the used names", () => {
			const sf = createSourceFile(`
				import { join, resolve, basename } from "node:path";
				function buildPath() { return join("a", resolve("b")); }
			`);
			const fn = requireFunction(sf, "buildPath");

			const imports = resolveImports(fn, [], sf);

			expect(imports).toHaveLength(1);
			expect(imports[0].namedImports.sort()).toEqual(["join", "resolve"]);
		});
	});

	describe("when no imports are needed", () => {
		it("should return an empty array", () => {
			const sf = createSourceFile(`
				function add(a: number, b: number) { return a + b; }
			`);
			const fn = requireFunction(sf, "add");

			const imports = resolveImports(fn, [], sf);

			expect(imports).toEqual([]);
		});
	});
});
