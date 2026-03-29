import { describe, expect, it } from "vitest";
import { computeRewrites } from "./index";

describe("computeRewrites", () => {
	describe("when a target file is moved", () => {
		it("should rewrite the import specifier", () => {
			const moves = [{ from: "src/utils/helper.ts", to: "src/lib/helper.ts", reason: "test" }];
			const edges = [
				{
					source: "src/commands/foo.ts",
					target: "src/utils/helper.ts",
					specifier: "../utils/helper",
				},
			];
			const allFiles = new Set(["src/commands/foo.ts", "src/utils/helper.ts"]);

			const result = computeRewrites(moves, edges, allFiles);

			expect(result).toEqual([
				{
					file: "src/commands/foo.ts",
					oldSpecifier: "../utils/helper",
					newSpecifier: "../lib/helper",
				},
			]);
		});
	});

	describe("when the source file is moved to a different depth", () => {
		it("should rewrite the specifier relative to the new location", () => {
			const moves = [{ from: "src/commands/sub/foo.ts", to: "src/lib/foo.ts", reason: "test" }];
			const edges = [
				{
					source: "src/commands/sub/foo.ts",
					target: "src/utils/helper.ts",
					specifier: "../../utils/helper",
				},
			];
			const allFiles = new Set(["src/commands/sub/foo.ts", "src/utils/helper.ts"]);

			const result = computeRewrites(moves, edges, allFiles);

			expect(result).toEqual([
				{
					file: "src/commands/sub/foo.ts",
					oldSpecifier: "../../utils/helper",
					newSpecifier: "../utils/helper",
				},
			]);
		});
	});

	describe("when no files are affected", () => {
		it("should return no rewrites", () => {
			const moves = [{ from: "src/other/x.ts", to: "src/other/y.ts", reason: "test" }];
			const edges = [
				{
					source: "src/commands/foo.ts",
					target: "src/utils/helper.ts",
					specifier: "../utils/helper",
				},
			];
			const allFiles = new Set(["src/commands/foo.ts", "src/utils/helper.ts"]);

			const result = computeRewrites(moves, edges, allFiles);

			expect(result).toEqual([]);
		});
	});

	describe("when the specifier resolves to the same value", () => {
		it("should not create a rewrite", () => {
			const moves = [{ from: "src/a/foo.ts", to: "src/b/foo.ts", reason: "test" }];
			const edges = [
				{
					source: "src/a/foo.ts",
					target: "src/a/bar.ts",
					specifier: "./bar",
				},
			];
			const allFiles = new Set(["src/a/foo.ts", "src/a/bar.ts"]);

			const result = computeRewrites(moves, edges, allFiles);

			expect(result).toEqual([
				{
					file: "src/a/foo.ts",
					oldSpecifier: "./bar",
					newSpecifier: "../a/bar",
				},
			]);
		});
	});

	describe("when both source and target are moved", () => {
		it("should compute the specifier relative to new locations", () => {
			const moves = [
				{ from: "src/a/foo.ts", to: "src/c/foo.ts", reason: "test" },
				{ from: "src/b/bar.ts", to: "src/c/bar.ts", reason: "test" },
			];
			const edges = [
				{
					source: "src/a/foo.ts",
					target: "src/b/bar.ts",
					specifier: "../b/bar",
				},
			];
			const allFiles = new Set(["src/a/foo.ts", "src/b/bar.ts"]);

			const result = computeRewrites(moves, edges, allFiles);

			expect(result).toEqual([
				{
					file: "src/a/foo.ts",
					oldSpecifier: "../b/bar",
					newSpecifier: "./bar",
				},
			]);
		});
	});
});
