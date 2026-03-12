import fs from "node:fs";
import path from "node:path";
import { findSourceFiles } from "../../../shared/findSourceFiles";

export type FileNameViolation = {
	filePath: string;
	fileName: string;
	suggestedName: string;
};

function hasClassOrComponent(content: string): boolean {
	const classPattern = /^(export\s+)?(abstract\s+)?class\s+\w+/m;
	const functionComponentPattern =
		/^(export\s+)?(default\s+)?function\s+[A-Z]\w*\s*\(/m;
	const arrowComponentPattern = /^(export\s+)?(const|let)\s+[A-Z]\w*\s*=.*=>/m;

	return (
		classPattern.test(content) ||
		functionComponentPattern.test(content) ||
		arrowComponentPattern.test(content)
	);
}

function hasMatchingTypeExport(
	content: string,
	nameWithoutExt: string,
): boolean {
	const typePattern = new RegExp(
		`^export\\s+type\\s+${nameWithoutExt}\\b`,
		"m",
	);
	const interfacePattern = new RegExp(
		`^export\\s+interface\\s+${nameWithoutExt}\\b`,
		"m",
	);
	return typePattern.test(content) || interfacePattern.test(content);
}

function suggestName(fileName: string): string {
	const nameWithoutExt = fileName.replace(/\.(ts|tsx)$/, "");
	const ext = fileName.slice(nameWithoutExt.length);

	// SCREAMING_SNAKE_CASE → camelCase (e.g. OC_COLORS → ocColors)
	if (/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/.test(nameWithoutExt)) {
		const camel = nameWithoutExt
			.toLowerCase()
			.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
		return `${camel}${ext}`;
	}

	return `${nameWithoutExt.charAt(0).toLowerCase()}${nameWithoutExt.slice(1)}${ext}`;
}

export function checkFileNames(): FileNameViolation[] {
	const sourceFiles = findSourceFiles("src");
	const violations: FileNameViolation[] = [];

	for (const filePath of sourceFiles) {
		const fileName = path.basename(filePath);
		const nameWithoutExt = fileName.replace(/\.(ts|tsx)$/, "");

		// Skip .stories and .test files — they mirror the component/module name
		if (/\.(stories|test)\.(ts|tsx)$/.test(fileName)) continue;

		if (/^[A-Z]/.test(nameWithoutExt)) {
			const content = fs.readFileSync(filePath, "utf-8");
			if (
				!hasClassOrComponent(content) &&
				!hasMatchingTypeExport(content, nameWithoutExt)
			) {
				violations.push({
					filePath,
					fileName,
					suggestedName: suggestName(fileName),
				});
			}
		}
	}

	return violations;
}
