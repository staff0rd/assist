import { describe, expect, it } from "vitest";
import { formatImportLine } from "./formatImportLine";

describe("formatImportLine", () => {
	describe("when given named imports only", () => {
		it("should format correctly", () => {
			const result = formatImportLine({
				isTypeOnly: false,
				defaultImport: undefined,
				namespaceImport: undefined,
				namedImports: ["foo", "bar"],
				moduleSpecifier: "./module",
			});

			expect(result).toBe('import { foo, bar } from "./module";');
		});
	});

	describe("when given a default import only", () => {
		it("should format correctly", () => {
			const result = formatImportLine({
				isTypeOnly: false,
				defaultImport: "React",
				namespaceImport: undefined,
				namedImports: [],
				moduleSpecifier: "react",
			});

			expect(result).toBe('import React from "react";');
		});
	});

	describe("when given a default and named imports", () => {
		it("should include both", () => {
			const result = formatImportLine({
				isTypeOnly: false,
				defaultImport: "React",
				namespaceImport: undefined,
				namedImports: ["useState"],
				moduleSpecifier: "react",
			});

			expect(result).toBe('import React, { useState } from "react";');
		});
	});

	describe("when given a namespace import", () => {
		it("should use * as syntax", () => {
			const result = formatImportLine({
				isTypeOnly: false,
				defaultImport: undefined,
				namespaceImport: "path",
				namedImports: [],
				moduleSpecifier: "node:path",
			});

			expect(result).toBe('import * as path from "node:path";');
		});
	});

	describe("when type-only", () => {
		it("should prepend type keyword", () => {
			const result = formatImportLine({
				isTypeOnly: true,
				defaultImport: undefined,
				namespaceImport: undefined,
				namedImports: ["Foo"],
				moduleSpecifier: "./types",
			});

			expect(result).toBe('import type { Foo } from "./types";');
		});
	});
});
