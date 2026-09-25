import type ts from "typescript";
import { getImportSpecifiers } from "./getImportSpecifiers";
import { getMockSpecifiers } from "./getMockSpecifiers";

export function specifiersOf(
	sourceFile: ts.SourceFile,
	includeMocks: boolean,
): { specifier: string; mock: boolean }[] {
	const imports = getImportSpecifiers(sourceFile).map((specifier) => ({
		specifier,
		mock: false,
	}));
	if (!includeMocks) return imports;
	const mocks = getMockSpecifiers(sourceFile).map((specifier) => ({
		specifier,
		mock: true,
	}));
	return [...imports, ...mocks];
}
