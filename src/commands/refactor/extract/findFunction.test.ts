import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { findFunction } from "./findFunction";

function createSourceFile(code: string) {
	const project = new Project({ useInMemoryFileSystem: true });
	return project.createSourceFile("test.ts", code);
}

describe("findFunction", () => {
	describe("when the function exists", () => {
		it("should return a node", () => {
			const sf = createSourceFile("function greet() { return 'hi'; }");

			const fn = findFunction(sf, "greet");

			expect(fn).toBeDefined();
		});

		it("should match by name", () => {
			const sf = createSourceFile("function greet() { return 'hi'; }");

			const fn = findFunction(sf, "greet");

			expect(fn?.getName()).toBe("greet");
		});
	});

	describe("when the function does not exist", () => {
		it("should return undefined", () => {
			const sf = createSourceFile("function greet() { return 'hi'; }");

			const result = findFunction(sf, "missing");

			expect(result).toBeUndefined();
		});
	});

	describe("when the function is exported", () => {
		it("should return a node", () => {
			const sf = createSourceFile("export function doWork() {}");

			const fn = findFunction(sf, "doWork");

			expect(fn).toBeDefined();
		});

		it("should match by name", () => {
			const sf = createSourceFile("export function doWork() {}");

			const fn = findFunction(sf, "doWork");

			expect(fn?.getName()).toBe("doWork");
		});
	});

	describe("when the name matches an arrow function variable", () => {
		it("should return undefined", () => {
			const sf = createSourceFile("const greet = () => 'hi';");

			const result = findFunction(sf, "greet");

			expect(result).toBeUndefined();
		});
	});
});
