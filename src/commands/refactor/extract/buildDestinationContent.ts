import { formatImportLine } from "./formatImportLine";
import type { RequiredImport } from "./types";

export function buildDestinationContent(
	functionTexts: string[],
	imports: RequiredImport[],
	sourceRelativePath: string,
	sourceImportNames: string[],
): string {
	const lines: string[] = [];

	for (const imp of imports) {
		lines.push(formatImportLine(imp));
	}

	if (sourceImportNames.length > 0) {
		lines.push(
			`import { ${sourceImportNames.join(", ")} } from "${sourceRelativePath}";`,
		);
	}

	if (lines.length > 0) lines.push("");

	for (let i = 0; i < functionTexts.length; i++) {
		if (i > 0) lines.push("");
		lines.push(functionTexts[i]);
	}

	lines.push("");
	return lines.join("\n");
}
