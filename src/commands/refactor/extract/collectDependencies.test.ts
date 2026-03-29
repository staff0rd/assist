import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { collectDependencies } from "./collectDependencies";
import { findFunction } from "./findFunction";

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

describe("collectDependencies", () => {
	it("returns empty when function has no private deps", () => {
		const sf = createSourceFile("function greet() { return 'hi'; }");
		const fn = requireFunction(sf, "greet");
		const { functions, statements } = collectDependencies(fn, sf);
		expect(functions).toEqual([]);
		expect(statements.toCopy).toEqual([]);
		expect(statements.toRemove).toEqual([]);
	});

	it("collects a direct private dependency", () => {
		const sf = createSourceFile(`
			function helper() { return 42; }
			function main() { return helper(); }
		`);
		const fn = requireFunction(sf, "main");
		const { functions } = collectDependencies(fn, sf);
		expect(functions.map((d) => d.getName())).toEqual(["helper"]);
	});

	it("collects transitive private dependencies", () => {
		const sf = createSourceFile(`
			function deep() { return 1; }
			function mid() { return deep(); }
			function top() { return mid(); }
		`);
		const fn = requireFunction(sf, "top");
		const { functions } = collectDependencies(fn, sf);
		const names = functions.map((d) => d.getName()).sort();
		expect(names).toEqual(["deep", "mid"]);
	});

	it("ignores exported functions", () => {
		const sf = createSourceFile(`
			export function sharedUtil() { return 1; }
			function main() { return sharedUtil(); }
		`);
		const fn = requireFunction(sf, "main");
		const { functions } = collectDependencies(fn, sf);
		expect(functions).toEqual([]);
	});

	it("handles circular calls without infinite loop", () => {
		const sf = createSourceFile(`
			function a() { return b(); }
			function b() { return a(); }
			function entry() { return a(); }
		`);
		const fn = requireFunction(sf, "entry");
		const { functions } = collectDependencies(fn, sf);
		const names = functions.map((d) => d.getName()).sort();
		expect(names).toEqual(["a", "b"]);
	});

	it("collects private variable dependencies", () => {
		const sf = createSourceFile(`
			const BASE = 200;
			function main() { return BASE; }
		`);
		const fn = requireFunction(sf, "main");
		const { statements } = collectDependencies(fn, sf);
		expect(statements.toCopy.length).toBe(1);
		expect(statements.toCopy[0].getText()).toContain("BASE");
	});

	it("ignores exported variables", () => {
		const sf = createSourceFile(`
			export const SHARED = 100;
			function main() { return SHARED; }
		`);
		const fn = requireFunction(sf, "main");
		const { statements } = collectDependencies(fn, sf);
		expect(statements.toCopy).toEqual([]);
	});

	it("collects private type alias dependencies", () => {
		const sf = createSourceFile(`
			type MyStore = { get: () => void };
			function main(s: MyStore) { return s.get(); }
		`);
		const fn = requireFunction(sf, "main");
		const { statements } = collectDependencies(fn, sf);
		expect(statements.toCopy.length).toBe(1);
		expect(statements.toCopy[0].getText()).toContain("MyStore");
	});

	it("does not remove shared type used by remaining functions", () => {
		const sf = createSourceFile(`
			type Store = { get: () => void };
			function extract(s: Store) { return s.get(); }
			function remaining(s: Store) { return s; }
		`);
		const fn = requireFunction(sf, "extract");
		const { statements } = collectDependencies(fn, sf);
		expect(statements.toCopy.length).toBe(1);
		expect(statements.toRemove).toEqual([]);
	});
});
