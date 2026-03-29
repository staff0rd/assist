import { type Project, type SourceFile, SyntaxKind } from "ts-morph";
import type { ExtractionPlan } from "./buildPlan";
import { removeStaleImports } from "./removeStaleImports";
import { updateImporters } from "./updateImporters";

function isNameReferencedInSource(
	sourceFile: SourceFile,
	name: string,
): boolean {
	return sourceFile
		.getDescendantsOfKind(SyntaxKind.Identifier)
		.some((id) => id.getText() === name);
}

export async function applyExtraction(
	functionName: string,
	sourceFile: SourceFile,
	destPath: string,
	plan: ExtractionPlan,
	project: Project,
): Promise<void> {
	project.createSourceFile(destPath, plan.destContent, { overwrite: false });

	for (const fn of [plan.target, ...plan.dependencies]) {
		fn.remove();
	}

	for (const stmt of plan.statementsToRemove) {
		stmt.remove();
	}

	removeStaleImports(sourceFile);

	if (isNameReferencedInSource(sourceFile, functionName)) {
		sourceFile.addImportDeclaration({
			moduleSpecifier: plan.destRelPath,
			namedImports: [functionName],
		});
	}

	updateImporters(functionName, sourceFile, plan.importersToUpdate);

	if (plan.barrel) {
		plan.barrel.addExportDeclaration({
			moduleSpecifier: plan.barrelRelPath,
			namedExports: [functionName],
		});
	}

	await project.save();
}
