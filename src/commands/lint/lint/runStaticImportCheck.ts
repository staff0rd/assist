import fs from "node:fs";
import { findSourceFiles } from "../../../shared/findSourceFiles";
import { type LintViolation, reportViolations } from "../shared";
import { isAllowedLazyImport } from "./isAllowedLazyImport";

function checkForDynamicImports(filePath: string): LintViolation[] {
	const content = fs.readFileSync(filePath, "utf8");
	const lines = content.split("\n");
	const violations: LintViolation[] = [];

	const requirePattern = /\brequire\s*\(/;
	const dynamicImportPattern = /\bimport\s*\(/;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const isDynamicImport =
			dynamicImportPattern.test(line) && !isAllowedLazyImport(filePath, line);
		if (requirePattern.test(line) || isDynamicImport) {
			violations.push({
				filePath,
				line: i + 1,
				content: line.trim(),
			});
		}
	}

	return violations;
}

function checkStaticImports(): LintViolation[] {
	const sourceFiles = findSourceFiles("src");
	const violations: LintViolation[] = [];

	for (const filePath of sourceFiles) {
		violations.push(...checkForDynamicImports(filePath));
	}

	return violations;
}

export function runStaticImportCheck(): boolean {
	return reportViolations(
		checkStaticImports(),
		"Static import check",
		"Dynamic imports are not allowed outside lazy command loading in src/index.ts and register*.ts files (relative string literal only). Use static imports instead.",
		"Static import check passed. No dynamic imports found.",
	);
}
