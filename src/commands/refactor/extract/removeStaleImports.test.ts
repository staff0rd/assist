import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { removeStaleImports } from "./removeStaleImports";

function createSourceFile(code: string) {
	const project = new Project({ useInMemoryFileSystem: true });
	return project.createSourceFile("test.ts", code);
}

describe("removeStaleImports", () => {
	it("removes imports no longer referenced by remaining code", () => {
		const sf = createSourceFile(`
import type { BacklogItem, PlanPhase } from "./types";
function other() { return 1; }
		`);
		removeStaleImports(sf);
		expect(sf.getImportDeclarations()).toHaveLength(0);
	});

	it("keeps imports still used by remaining code", () => {
		const sf = createSourceFile(`
import type { BacklogItem, PlanPhase } from "./types";
function other(x: BacklogItem) { return x; }
		`);
		removeStaleImports(sf);
		const imports = sf.getImportDeclarations();
		expect(imports).toHaveLength(1);
		const named = imports[0].getNamedImports().map((n) => n.getName());
		expect(named).toEqual(["BacklogItem"]);
	});

	it("removes only unused named imports from a multi-import", () => {
		const sf = createSourceFile(`
import { join, resolve } from "node:path";
function buildPath() { return join("a", "b"); }
		`);
		removeStaleImports(sf);
		const imports = sf.getImportDeclarations();
		expect(imports).toHaveLength(1);
		const named = imports[0].getNamedImports().map((n) => n.getName());
		expect(named).toEqual(["join"]);
	});

	it("removes entire import when all named imports are unused", () => {
		const sf = createSourceFile(`
import { join, resolve } from "node:path";
function add(a: number, b: number) { return a + b; }
		`);
		removeStaleImports(sf);
		expect(sf.getImportDeclarations()).toHaveLength(0);
	});

	it("keeps default import when still referenced", () => {
		const sf = createSourceFile(`
import chalk from "chalk";
function log() { return chalk.green("ok"); }
		`);
		removeStaleImports(sf);
		expect(sf.getImportDeclarations()).toHaveLength(1);
		expect(sf.getImportDeclarations()[0].getDefaultImport()?.getText()).toBe(
			"chalk",
		);
	});

	it("removes default import when not referenced", () => {
		const sf = createSourceFile(`
import chalk from "chalk";
function add(a: number, b: number) { return a + b; }
		`);
		removeStaleImports(sf);
		expect(sf.getImportDeclarations()).toHaveLength(0);
	});
});
