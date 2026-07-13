import { Project, SyntaxKind } from "ts-morph";
import { describe, expect, it } from "vitest";
import { findTarget } from "./findTarget";

function createSourceFile(code: string) {
	const project = new Project({ useInMemoryFileSystem: true });
	return project.createSourceFile("test.ts", code);
}

describe("findTarget", () => {
	describe("when the target is a function declaration", () => {
		it("should return the declaration", () => {
			const sf = createSourceFile("export function doWork() {}");

			const target = findTarget(sf, "doWork");

			expect(target?.getKind()).toBe(SyntaxKind.FunctionDeclaration);
		});
	});

	describe("when the target is a const-assigned arrow function", () => {
		it("should return the variable statement", () => {
			const sf = createSourceFile("export const doWork = () => 'hi';");

			const target = findTarget(sf, "doWork");

			expect(target?.getKind()).toBe(SyntaxKind.VariableStatement);
		});
	});

	describe("when the target is a const-assigned function expression", () => {
		it("should return the variable statement", () => {
			const sf = createSourceFile("const doWork = function () { return 1; };");

			const target = findTarget(sf, "doWork");

			expect(target?.getKind()).toBe(SyntaxKind.VariableStatement);
		});
	});

	describe("when the const is not a function", () => {
		it("should return undefined", () => {
			const sf = createSourceFile("const value = 42;");

			const target = findTarget(sf, "value");

			expect(target).toBeUndefined();
		});
	});

	describe("when the name does not exist", () => {
		it("should return undefined", () => {
			const sf = createSourceFile("function greet() {}");

			const target = findTarget(sf, "missing");

			expect(target).toBeUndefined();
		});
	});
});
