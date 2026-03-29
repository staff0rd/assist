import path from "node:path";
import type { RequiredImport } from "./types";

export function rewriteImportPaths(
	imports: RequiredImport[],
	sourcePath: string,
	destPath: string,
): RequiredImport[] {
	const sourceDir = path.dirname(sourcePath);
	const destDir = path.dirname(destPath);
	return imports.map((imp) => {
		if (!imp.moduleSpecifier.startsWith(".")) return imp;
		const absolute = path.resolve(sourceDir, imp.moduleSpecifier);
		let rel = path.relative(destDir, absolute).replace(/\\/g, "/");
		if (rel === "") rel = `../${path.basename(absolute)}`;
		else if (!rel.startsWith(".")) rel = `./${rel}`;
		return { ...imp, moduleSpecifier: rel };
	});
}
