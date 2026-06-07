import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ensureReviewsIgnored } from "./ensureReviewsIgnored";

function makeTempDir(): string {
	return mkdtempSync(join(tmpdir(), "ensure-reviews-ignored-"));
}

describe("ensureReviewsIgnored", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
	});

	describe("when the repo has no .gitignore", () => {
		it("should create one with the reviews entry", () => {
			const repoRoot = makeTempDir();

			ensureReviewsIgnored(repoRoot);

			expect(readFileSync(join(repoRoot, ".gitignore"), "utf-8")).toBe(
				".assist/reviews\n",
			);
		});
	});

	describe("when .gitignore lacks a reviews entry", () => {
		it("should append the entry", () => {
			const repoRoot = makeTempDir();
			writeFileSync(join(repoRoot, ".gitignore"), "node_modules\n");

			ensureReviewsIgnored(repoRoot);

			expect(readFileSync(join(repoRoot, ".gitignore"), "utf-8")).toBe(
				"node_modules\n.assist/reviews\n",
			);
		});

		it("should keep the existing content on its own line when there is no trailing newline", () => {
			const repoRoot = makeTempDir();
			writeFileSync(join(repoRoot, ".gitignore"), "node_modules");

			ensureReviewsIgnored(repoRoot);

			expect(readFileSync(join(repoRoot, ".gitignore"), "utf-8")).toBe(
				"node_modules\n.assist/reviews\n",
			);
		});
	});

	describe("when .gitignore already covers the reviews folder", () => {
		it.each([
			".assist/reviews",
			".assist/reviews/",
			"/.assist/reviews",
			".assist",
			".assist/",
		])("should leave .gitignore unchanged for entry %s", (entry) => {
			const repoRoot = makeTempDir();
			const content = `node_modules\n${entry}\n`;
			writeFileSync(join(repoRoot, ".gitignore"), content);

			ensureReviewsIgnored(repoRoot);

			expect(readFileSync(join(repoRoot, ".gitignore"), "utf-8")).toBe(content);
		});
	});
});
