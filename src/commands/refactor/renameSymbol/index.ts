import path from "node:path";
import chalk from "chalk";
import { Project } from "ts-morph";
import { findSymbol } from "./findSymbol";
import { groupReferences } from "./groupReferences";

type RenameSymbolOptions = {
	apply?: boolean;
};

export async function renameSymbol(
	file: string,
	oldName: string,
	newName: string,
	options: RenameSymbolOptions = {},
): Promise<void> {
	const filePath = path.resolve(file);
	const tsConfigPath = path.resolve("tsconfig.json");
	const cwd = process.cwd();

	const project = new Project({ tsConfigFilePath: tsConfigPath });
	const sourceFile = project.getSourceFile(filePath);

	if (!sourceFile) {
		console.log(chalk.red(`File not found in project: ${file}`));
		process.exit(1);
	}

	const symbol = findSymbol(sourceFile, oldName);
	if (!symbol) {
		console.log(chalk.red(`Symbol "${oldName}" not found in ${file}`));
		process.exit(1);
	}

	const grouped = groupReferences(symbol, cwd);
	const totalRefs = [...grouped.values()].reduce((s, l) => s + l.length, 0);

	console.log(
		chalk.bold(`Rename: ${oldName} → ${newName} (${totalRefs} references)\n`),
	);

	for (const [refFile, lines] of grouped) {
		console.log(
			`  ${chalk.dim(refFile)}: lines ${chalk.cyan(lines.join(", "))}`,
		);
	}

	if (options.apply) {
		symbol.rename(newName);
		await project.save();
		console.log(chalk.green(`\nRenamed ${oldName} → ${newName}`));
	} else {
		console.log(chalk.dim("\nDry run. Use --apply to execute."));
	}
}
