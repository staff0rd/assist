import ts from "typescript";
import { describe, expect, it } from "vitest";
import { calculateHalstead } from "./index";

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
	if (!fn) throw new Error("No function declaration found");
	return fn;
}

describe("calculateHalstead", () => {
	describe("when given a simple function", () => {
		it("should return positive metrics", () => {
			const node = parseFunction("function f() { return 1; }");

			const result = calculateHalstead(node);

			expect(result.length).toBeGreaterThan(0);
			expect(result.vocabulary).toBeGreaterThan(0);
			expect(result.volume).toBeGreaterThan(0);
		});
	});

	describe("when given a minimal function body", () => {
		it("should return low metrics", () => {
			const node = parseFunction("function f() {}");

			const result = calculateHalstead(node);

			expect(result.length).toBeLessThanOrEqual(2);
		});
	});

	describe("when given a function with operators", () => {
		it("should count them", () => {
			const node = parseFunction(
				"function f(a: number, b: number) { return a + b; }",
			);

			const result = calculateHalstead(node);

			expect(result.length).toBeGreaterThan(0);
			expect(result.difficulty).toBeGreaterThan(0);
		});
	});

	describe("when given a complex function", () => {
		it("should have higher effort than a simple one", () => {
			const simple = parseFunction("function f() { return 1; }");
			const complex = parseFunction(
				"function f(a: number, b: number) { if (a > b) { return a * b + 1; } else { return b - a; } }",
			);

			const simpleResult = calculateHalstead(simple);
			const complexResult = calculateHalstead(complex);

			expect(complexResult.effort).toBeGreaterThan(simpleResult.effort);
		});
	});

	describe("metrics relationships", () => {
		it("should have time proportional to effort", () => {
			const node = parseFunction("function f(x: number) { return x * x + 1; }");

			const result = calculateHalstead(node);

			expect(result.time).toBeCloseTo(result.effort / 18);
		});

		it("should have bugs proportional to volume", () => {
			const node = parseFunction("function f(x: number) { return x * x + 1; }");

			const result = calculateHalstead(node);

			expect(result.bugsDelivered).toBeCloseTo(result.volume / 3000);
		});
	});
});
