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
	it("includes imports used by the target function", () => {
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

	it("excludes imports not used by extracted functions", () => {
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

	it("includes imports used by dependencies", () => {
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

	it("handles type-only imports", () => {
		const sf = createSourceFile(`
			import type { Foo } from "./types";
			function useFoo(x: Foo) { return x; }
		`);
		const fn = requireFunction(sf, "useFoo");
		const imports = resolveImports(fn, [], sf);
		expect(imports).toHaveLength(1);
		expect(imports[0].isTypeOnly).toBe(true);
	});

	it("only includes the used named imports from a multi-import", () => {
		const sf = createSourceFile(`
			import { join, resolve, basename } from "node:path";
			function buildPath() { return join("a", resolve("b")); }
		`);
		const fn = requireFunction(sf, "buildPath");
		const imports = resolveImports(fn, [], sf);
		expect(imports).toHaveLength(1);
		expect(imports[0].namedImports.sort()).toEqual(["join", "resolve"]);
	});

	it("returns empty array when no imports are needed", () => {
		const sf = createSourceFile(`
			function add(a: number, b: number) { return a + b; }
		`);
		const fn = requireFunction(sf, "add");
		const imports = resolveImports(fn, [], sf);
		expect(imports).toEqual([]);
	});
});
