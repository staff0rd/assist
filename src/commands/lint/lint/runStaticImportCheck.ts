import fs from "node:fs";
import { findSourceFiles } from "../../../shared/findSourceFiles";
import { type LintViolation, reportViolations } from "../shared";

function checkForDynamicImports(filePath: string): LintViolation[] {
	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split("\n");
	const violations: LintViolation[] = [];

	const requirePattern = /\brequire\s*\(/;
	const dynamicImportPattern = /\bimport\s*\(/;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (requirePattern.test(line) || dynamicImportPattern.test(line)) {
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
		"Dynamic imports are not allowed. Use static imports instead.",
		"Static import check passed. No dynamic imports found.",
	);
}
