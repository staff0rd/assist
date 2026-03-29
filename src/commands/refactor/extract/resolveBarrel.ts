import path from "node:path";
import type { Project } from "ts-morph";
import { getRelativeImportPath } from "./getRelativeImportPath";

export function resolveBarrel(
	functionName: string,
	sourcePath: string,
	destPath: string,
	project: Project,
) {
	const indexPath = path.join(path.dirname(destPath), "index.ts");
	const barrel = project.getSourceFile(indexPath);
	if (!barrel) return { barrel: undefined, barrelRelPath: "" };

	const sourceRelFromBarrel = getRelativeImportPath(indexPath, sourcePath);
	const alreadyExported = barrel.getExportDeclarations().some((decl) => {
		const specifier = decl.getModuleSpecifierValue();
		if (specifier !== sourceRelFromBarrel) return false;
		const named = decl.getNamedExports();
		return named.some((n) => n.getName() === functionName);
	});

	if (!alreadyExported) return { barrel: undefined, barrelRelPath: "" };

	return {
		barrel,
		barrelRelPath: getRelativeImportPath(indexPath, destPath),
	};
}
