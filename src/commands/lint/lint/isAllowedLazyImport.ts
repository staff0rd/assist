import path from "node:path";

const LAZY_IMPORT_PATTERN = /\bimport\s*\(\s*["']\.{1,2}\/[^"']+["']\s*\)/g;
const ANY_IMPORT_PATTERN = /\bimport\s*\(/g;

function isLazyLoadFile(filePath: string): boolean {
	const normalized = filePath.split(path.sep).join("/");
	if (normalized === "src/index.ts" || normalized.endsWith("/src/index.ts")) {
		return true;
	}
	return /^register[A-Z]\w*\.ts$/.test(path.basename(filePath));
}

// why: the CLI entry and command registration lazy-load command modules so startup stays cheap
export function isAllowedLazyImport(filePath: string, line: string): boolean {
	if (!isLazyLoadFile(filePath)) return false;
	const total = line.match(ANY_IMPORT_PATTERN)?.length ?? 0;
	const lazy = line.match(LAZY_IMPORT_PATTERN)?.length ?? 0;
	return total > 0 && total === lazy;
}
