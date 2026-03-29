import { describe, expect, it } from "vitest";
import ts from "typescript";
import { getNodeName, hasFunctionBody } from "./getNodeName";

function parse(code: string): ts.SourceFile {
	return ts.createSourceFile("test.ts", code, ts.ScriptTarget.Latest, true);
}

function findFirst(sourceFile: ts.SourceFile, kind: ts.SyntaxKind): ts.Node {
	let found: ts.Node | undefined;
	const visit = (node: ts.Node): void => {
		if (!found && node.kind === kind) {
			found = node;
			return;
		}
		ts.forEachChild(node, visit);
	};
	visit(sourceFile);
	return found!;
}

describe("getNodeName", () => {
	describe("when given a named function declaration", () => {
		it("should return the function name", () => {
			const sf = parse("function myFunc() {}");
			const node = findFirst(sf, ts.SyntaxKind.FunctionDeclaration);

			expect(getNodeName(node)).toBe("myFunc");
		});
	});

	describe("when given an anonymous function expression", () => {
		it("should return <anonymous>", () => {
			const sf = parse("const x = function() {}");
			const node = findFirst(sf, ts.SyntaxKind.FunctionExpression);

			expect(getNodeName(node)).toBe("<anonymous>");
		});
	});

	describe("when given an arrow function assigned to a variable", () => {
		it("should return the variable name", () => {
			const sf = parse("const myArrow = () => {}");
			const node = findFirst(sf, ts.SyntaxKind.ArrowFunction);

			expect(getNodeName(node)).toBe("myArrow");
		});
	});

	describe("when given a method declaration", () => {
		it("should return the method name", () => {
			const sf = parse("class C { myMethod() {} }");
			const node = findFirst(sf, ts.SyntaxKind.MethodDeclaration);

			expect(getNodeName(node)).toBe("myMethod");
		});
	});

	describe("when given a constructor", () => {
		it("should return constructor", () => {
			const sf = parse("class C { constructor() {} }");
			const node = findFirst(sf, ts.SyntaxKind.Constructor);

			expect(getNodeName(node)).toBe("constructor");
		});
	});

	describe("when given a getter", () => {
		it("should return get prefix with name", () => {
			const sf = parse("class C { get value() { return 1; } }");
			const node = findFirst(sf, ts.SyntaxKind.GetAccessor);

			expect(getNodeName(node)).toBe("get value");
		});
	});

	describe("when given a setter", () => {
		it("should return set prefix with name", () => {
			const sf = parse("class C { set value(v: number) {} }");
			const node = findFirst(sf, ts.SyntaxKind.SetAccessor);

			expect(getNodeName(node)).toBe("set value");
		});
	});
});

describe("hasFunctionBody", () => {
	describe("when given a function declaration with a body", () => {
		it("should return true", () => {
			const sf = parse("function f() {}");
			const node = findFirst(sf, ts.SyntaxKind.FunctionDeclaration);

			expect(hasFunctionBody(node)).toBe(true);
		});
	});

	describe("when given a non-function node", () => {
		it("should return false", () => {
			const sf = parse("const x = 1;");
			const node = findFirst(sf, ts.SyntaxKind.VariableDeclaration);

			expect(hasFunctionBody(node)).toBe(false);
		});
	});
});
