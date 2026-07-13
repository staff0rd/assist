import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { analyseTarget } from "./analyseTarget";

function createSourceFile(code: string) {
	const project = new Project({ useInMemoryFileSystem: true });
	return project.createSourceFile("test.tsx", code);
}

describe("analyseTarget", () => {
	describe("when the target is a function declaration", () => {
		it("should resolve it by name", () => {
			const sf = createSourceFile("export function doWork() { return 1; }");

			const analysis = analyseTarget(sf, "doWork");

			expect(analysis.extractedNames).toContain("doWork");
		});
	});

	describe("when the target is a const-assigned arrow function", () => {
		it("should resolve it by name", () => {
			const sf = createSourceFile(
				"export const DeleteItemButton = () => null;",
			);

			const analysis = analyseTarget(sf, "DeleteItemButton");

			expect(analysis.extractedNames).toContain("DeleteItemButton");
		});

		it("should keep the export in the moved text", () => {
			const sf = createSourceFile(
				"export const DeleteItemButton = () => null;",
			);

			const analysis = analyseTarget(sf, "DeleteItemButton");

			expect(analysis.functionTexts.join("\n")).toContain(
				"export const DeleteItemButton",
			);
		});

		it("should add the export when the arrow const is not exported", () => {
			const sf = createSourceFile("const helper = () => null;");

			const analysis = analyseTarget(sf, "helper");

			expect(analysis.functionTexts.join("\n")).toContain(
				"export const helper",
			);
		});

		it("should resolve imports used by the arrow function", () => {
			const sf = createSourceFile(`
				import { clsx } from "clsx";
				export const Button = (className: string) => clsx(className);
			`);

			const analysis = analyseTarget(sf, "Button");

			expect(analysis.imports.map((i) => i.moduleSpecifier)).toContain("clsx");
		});

		it("should keep private function dependencies", () => {
			const sf = createSourceFile(`
				function label() { return "x"; }
				export const Button = () => label();
			`);

			const analysis = analyseTarget(sf, "Button");

			expect(analysis.dependencies.map((d) => d.getName())).toContain("label");
		});
	});

	describe("when the target is a const-assigned function expression", () => {
		it("should resolve it by name", () => {
			const sf = createSourceFile(
				"export const doWork = function () { return 1; };",
			);

			const analysis = analyseTarget(sf, "doWork");

			expect(analysis.extractedNames).toContain("doWork");
		});
	});

	describe("when the target does not exist", () => {
		it("should throw", () => {
			const sf = createSourceFile("const value = 42;");

			expect(() => analyseTarget(sf, "value")).toThrow(/not found/);
		});
	});
});
