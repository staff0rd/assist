import fs from "node:fs";
import { findSourceFiles } from "../../../shared/findSourceFiles";
import { type LintViolation, reportViolations } from "../shared";

function checkForImportExtensions(filePath: string): LintViolation[] {
	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split("\n");
	const violations: LintViolation[] = [];

	// Matches relative imports with .js or .ts extensions
	const importExtensionPattern = /from\s+["']\..*\.(js|ts)["']/;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (importExtensionPattern.test(line)) {
			violations.push({
				filePath,
				line: i + 1,
				content: line.trim(),
			});
		}
	}

	return violations;
}

function checkImportExtensions(): LintViolation[] {
	const sourceFiles = findSourceFiles("src");
	const violations: LintViolation[] = [];

	for (const filePath of sourceFiles) {
		violations.push(...checkForImportExtensions(filePath));
	}

	return violations;
}

export function runImportExtensionCheck(): boolean {
	return reportViolations(
		checkImportExtensions(),
		"Import extension check",
		"File extensions in imports are not allowed. Use extensionless imports instead.",
		"Import extension check passed. No file extensions in imports found.",
	);
}
