import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { findFunction } from "./findFunction";

function createSourceFile(code: string) {
	const project = new Project({ useInMemoryFileSystem: true });
	return project.createSourceFile("test.ts", code);
}

describe("findFunction", () => {
	it("finds a named function declaration", () => {
		const sf = createSourceFile("function greet() { return 'hi'; }");
		const fn = findFunction(sf, "greet");
		expect(fn).toBeDefined();
		expect(fn?.getName()).toBe("greet");
	});

	it("returns undefined for a non-existent function", () => {
		const sf = createSourceFile("function greet() { return 'hi'; }");
		expect(findFunction(sf, "missing")).toBeUndefined();
	});

	it("finds an exported function", () => {
		const sf = createSourceFile("export function doWork() {}");
		const fn = findFunction(sf, "doWork");
		expect(fn).toBeDefined();
		expect(fn?.getName()).toBe("doWork");
	});

	it("ignores arrow functions assigned to variables", () => {
		const sf = createSourceFile("const greet = () => 'hi';");
		expect(findFunction(sf, "greet")).toBeUndefined();
	});
});
