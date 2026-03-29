import { describe, expect, it } from "vitest";
import ts from "typescript";
import { calculateCyclomaticComplexity } from "./calculateCyclomaticComplexity";

function parseFunction(code: string): ts.Node {
	const sourceFile = ts.createSourceFile(
		"test.ts",
		code,
		ts.ScriptTarget.Latest,
		true,
	);
	let fn: ts.Node | undefined;
	ts.forEachChild(sourceFile, (node) => {
		if (ts.isFunctionDeclaration(node)) fn = node;
	});
	return fn!;
}

describe("calculateCyclomaticComplexity", () => {
	describe("when given a simple function", () => {
		it("should return 1", () => {
			const node = parseFunction("function f() { return 1; }");

			expect(calculateCyclomaticComplexity(node)).toBe(1);
		});
	});

	describe("when given an if statement", () => {
		it("should increment complexity", () => {
			const node = parseFunction(
				"function f(x: boolean) { if (x) { return 1; } return 0; }",
			);

			expect(calculateCyclomaticComplexity(node)).toBe(2);
		});
	});

	describe("when given a for loop", () => {
		it("should increment complexity", () => {
			const node = parseFunction(
				"function f() { for (let i = 0; i < 10; i++) {} }",
			);

			expect(calculateCyclomaticComplexity(node)).toBe(2);
		});
	});

	describe("when given logical operators", () => {
		it("should increment for && and ||", () => {
			const node = parseFunction(
				"function f(a: boolean, b: boolean) { if (a && b || a) {} }",
			);

			// 1 base + 1 if + 1 && + 1 || = 4
			expect(calculateCyclomaticComplexity(node)).toBe(4);
		});
	});

	describe("when given a ternary expression", () => {
		it("should increment complexity", () => {
			const node = parseFunction(
				"function f(x: boolean) { return x ? 1 : 0; }",
			);

			expect(calculateCyclomaticComplexity(node)).toBe(2);
		});
	});

	describe("when given a switch with cases", () => {
		it("should increment for each case", () => {
			const node = parseFunction(
				"function f(x: number) { switch(x) { case 1: break; case 2: break; } }",
			);

			// 1 base + 2 cases = 3
			expect(calculateCyclomaticComplexity(node)).toBe(3);
		});
	});

	describe("when given a nullish coalescing operator", () => {
		it("should increment complexity", () => {
			const node = parseFunction(
				"function f(x: number | null) { return x ?? 0; }",
			);

			expect(calculateCyclomaticComplexity(node)).toBe(2);
		});
	});
});
