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
	describe("when the function has no private dependencies", () => {
		it("should return no functions", () => {
			const sf = createSourceFile("function greet() { return 'hi'; }");
			const fn = requireFunction(sf, "greet");

			const { functions } = collectDependencies(fn, sf);

			expect(functions.toCopy).toEqual([]);
		});

		it("should return no statements to copy", () => {
			const sf = createSourceFile("function greet() { return 'hi'; }");
			const fn = requireFunction(sf, "greet");

			const { statements } = collectDependencies(fn, sf);

			expect(statements.toCopy).toEqual([]);
		});

		it("should return no statements to remove", () => {
			const sf = createSourceFile("function greet() { return 'hi'; }");
			const fn = requireFunction(sf, "greet");

			const { statements } = collectDependencies(fn, sf);

			expect(statements.toRemove).toEqual([]);
		});
	});

	describe("when the function calls a private helper", () => {
		it("should collect the helper", () => {
			const sf = createSourceFile(`
				function helper() { return 42; }
				function main() { return helper(); }
			`);
			const fn = requireFunction(sf, "main");

			const { functions } = collectDependencies(fn, sf);

			expect(functions.toCopy.map((d) => d.getName())).toEqual(["helper"]);
		});
	});

	describe("when the function has transitive private dependencies", () => {
		it("should collect all transitive helpers", () => {
			const sf = createSourceFile(`
				function deep() { return 1; }
				function mid() { return deep(); }
				function top() { return mid(); }
			`);
			const fn = requireFunction(sf, "top");

			const { functions } = collectDependencies(fn, sf);

			const names = functions.toCopy.map((d) => d.getName()).sort();
			expect(names).toEqual(["deep", "mid"]);
		});
	});

	describe("when the dependency is an exported function", () => {
		it("should exclude it", () => {
			const sf = createSourceFile(`
				export function sharedUtil() { return 1; }
				function main() { return sharedUtil(); }
			`);
			const fn = requireFunction(sf, "main");

			const { functions } = collectDependencies(fn, sf);

			expect(functions.toCopy).toEqual([]);
		});
	});

	describe("when there are circular calls", () => {
		it("should collect without infinite loop", () => {
			const sf = createSourceFile(`
				function a() { return b(); }
				function b() { return a(); }
				function entry() { return a(); }
			`);
			const fn = requireFunction(sf, "entry");

			const { functions } = collectDependencies(fn, sf);

			const names = functions.toCopy.map((d) => d.getName()).sort();
			expect(names).toEqual(["a", "b"]);
		});
	});

	describe("when the function references a private variable", () => {
		it("should include the statement in toCopy", () => {
			const sf = createSourceFile(`
				const BASE = 200;
				function main() { return BASE; }
			`);
			const fn = requireFunction(sf, "main");

			const { statements } = collectDependencies(fn, sf);

			expect(statements.toCopy.length).toBe(1);
		});

		it("should contain the variable name", () => {
			const sf = createSourceFile(`
				const BASE = 200;
				function main() { return BASE; }
			`);
			const fn = requireFunction(sf, "main");

			const { statements } = collectDependencies(fn, sf);

			expect(statements.toCopy[0].getText()).toContain("BASE");
		});
	});

	describe("when the variable is exported", () => {
		it("should exclude it", () => {
			const sf = createSourceFile(`
				export const SHARED = 100;
				function main() { return SHARED; }
			`);
			const fn = requireFunction(sf, "main");

			const { statements } = collectDependencies(fn, sf);

			expect(statements.toCopy).toEqual([]);
		});
	});

	describe("when the function references a private type alias", () => {
		it("should include the statement in toCopy", () => {
			const sf = createSourceFile(`
				type MyStore = { get: () => void };
				function main(s: MyStore) { return s.get(); }
			`);
			const fn = requireFunction(sf, "main");

			const { statements } = collectDependencies(fn, sf);

			expect(statements.toCopy.length).toBe(1);
		});

		it("should contain the type name", () => {
			const sf = createSourceFile(`
				type MyStore = { get: () => void };
				function main(s: MyStore) { return s.get(); }
			`);
			const fn = requireFunction(sf, "main");

			const { statements } = collectDependencies(fn, sf);

			expect(statements.toCopy[0].getText()).toContain("MyStore");
		});
	});

	describe("when a helper is shared with remaining functions", () => {
		it("should include the helper in toCopy", () => {
			const sf = createSourceFile(`
				function helper() { return 42; }
				function extract() { return helper(); }
				function remaining() { return helper(); }
			`);
			const fn = requireFunction(sf, "extract");

			const { functions } = collectDependencies(fn, sf);

			expect(functions.toCopy.map((d) => d.getName())).toEqual(["helper"]);
		});

		it("should not mark the helper for removal", () => {
			const sf = createSourceFile(`
				function helper() { return 42; }
				function extract() { return helper(); }
				function remaining() { return helper(); }
			`);
			const fn = requireFunction(sf, "extract");

			const { functions } = collectDependencies(fn, sf);

			expect(functions.toRemove).toEqual([]);
		});

		it("should not remove statements used by shared helpers", () => {
			const sf = createSourceFile(`
				const BASE = 100;
				function helper() { return BASE; }
				function extract() { return helper(); }
				function remaining() { return helper(); }
			`);
			const fn = requireFunction(sf, "extract");

			const { statements } = collectDependencies(fn, sf);

			expect(statements.toCopy.length).toBe(1);
			expect(statements.toRemove).toEqual([]);
		});
	});

	describe("when a type is shared with remaining functions", () => {
		it("should include the statement in toCopy", () => {
			const sf = createSourceFile(`
				type Store = { get: () => void };
				function extract(s: Store) { return s.get(); }
				function remaining(s: Store) { return s; }
			`);
			const fn = requireFunction(sf, "extract");

			const { statements } = collectDependencies(fn, sf);

			expect(statements.toCopy.length).toBe(1);
		});

		it("should not mark it for removal", () => {
			const sf = createSourceFile(`
				type Store = { get: () => void };
				function extract(s: Store) { return s.get(); }
				function remaining(s: Store) { return s; }
			`);
			const fn = requireFunction(sf, "extract");

			const { statements } = collectDependencies(fn, sf);

			expect(statements.toRemove).toEqual([]);
		});
	});
});
