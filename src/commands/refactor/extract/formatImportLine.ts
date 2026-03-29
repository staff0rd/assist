import type { RequiredImport } from "./types";

export function formatImportLine(imp: RequiredImport): string {
	const parts: string[] = [];
	if (imp.isTypeOnly) parts.push("type ");
	if (imp.defaultImport) parts.push(imp.defaultImport);
	if (imp.namespaceImport) parts.push(`* as ${imp.namespaceImport}`);
	if (imp.namedImports.length > 0) {
		if (imp.defaultImport) parts.push(", ");
		parts.push(`{ ${imp.namedImports.join(", ")} }`);
	}
	return `import ${parts.join("")} from "${imp.moduleSpecifier}";`;
}
