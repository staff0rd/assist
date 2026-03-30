import { describe, expect, it } from "vitest";
import { buildDestinationContent } from "./buildDestinationContent";

describe("buildDestinationContent", () => {
	describe("when given functions with imports", () => {
		it("should include imports followed by functions", () => {
			const result = buildDestinationContent(
				["export function foo() {}"],
				[
					{
						isTypeOnly: false,
						defaultImport: undefined,
						namespaceImport: undefined,
						namedImports: ["bar"],
						moduleSpecifier: "./bar",
					},
				],
				"./source",
				[],
			);

			expect(result).toBe(
				'import { bar } from "./bar";\n\nexport function foo() {}\n',
			);
		});
	});

	describe("when given source import names", () => {
		it("should add an import from the source file", () => {
			const result = buildDestinationContent(
				["export function foo() {}"],
				[],
				"./source",
				["helper"],
			);

			expect(result).toBe(
				'import { helper } from "./source";\n\nexport function foo() {}\n',
			);
		});
	});

	describe("when given multiple functions", () => {
		it("should separate them with blank lines", () => {
			const result = buildDestinationContent(
				["export function a() {}", "export function b() {}"],
				[],
				"./source",
				[],
			);

			expect(result).toBe("export function a() {}\n\nexport function b() {}\n");
		});
	});

	describe("when given no imports and no source imports", () => {
		it("should output just the functions", () => {
			const result = buildDestinationContent(
				["export function foo() {}"],
				[],
				"./source",
				[],
			);

			expect(result).toBe("export function foo() {}\n");
		});
	});
});
