import path from "node:path";
import chalk from "chalk";
import type { ExtractionPlan } from "./buildPlan";
import { formatImportLine } from "./formatImportLine";

function section(title: string): string {
	return `\n  ${chalk.cyan(title)}`;
}

function displayImporters(plan: ExtractionPlan, cwd: string): void {
	if (plan.importersToUpdate.length === 0) return;
	console.log(section("Update importers:"));
	for (const imp of plan.importersToUpdate) {
		const rel = path.relative(cwd, imp.file.getFilePath());
		console.log(`    ${chalk.dim(rel)}: → import from "${imp.relPath}"`);
	}
}

export function displayPlan(
	functionName: string,
	relDest: string,
	plan: ExtractionPlan,
	cwd: string,
): void {
	console.log(chalk.bold(`Extract: ${functionName} → ${relDest}\n`));
	console.log(`  ${chalk.cyan("Functions to move:")}`);
	for (const name of plan.extractedNames) {
		console.log(`    ${name}`);
	}

	if (plan.imports.length > 0) {
		console.log(section("Imports to copy:"));
		for (const imp of plan.imports) {
			console.log(`    ${formatImportLine(imp)}`);
		}
	}

	if (plan.exportedDeps.length > 0) {
		console.log(section("New imports from source:"));
		console.log(
			`    import { ${plan.exportedDeps.join(", ")} } from "${plan.sourceRelPath}";`,
		);
	}

	console.log(section("Source file changes:"));
	console.log(`    Remove: ${plan.extractedNames.join(", ")}`);
	if (plan.sourceNeedsReimport) {
		console.log(
			`    Add: import { ${functionName} } from "${plan.destRelPath}";`,
		);
	}

	displayImporters(plan, cwd);

	if (plan.barrel) {
		console.log(section("Barrel export:"));
		console.log(
			`    Add: export { ${functionName} } from "${plan.barrelRelPath}";`,
		);
	}
}
