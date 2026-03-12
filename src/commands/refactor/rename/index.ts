import path from "node:path";
import chalk from "chalk";
import { Project } from "ts-morph";

type RenameOptions = {
	apply?: boolean;
};

export async function rename(
	source: string,
	destination: string,
	options: RenameOptions = {},
): Promise<void> {
	const sourcePath = path.resolve(source);
	const destPath = path.resolve(destination);
	const cwd = process.cwd();
	const relSource = path.relative(cwd, sourcePath);
	const relDest = path.relative(cwd, destPath);

	const project = new Project({
		tsConfigFilePath: path.resolve("tsconfig.json"),
	});
	const sourceFile = project.getSourceFile(sourcePath);

	if (!sourceFile) {
		console.log(chalk.red(`File not found in project: ${source}`));
		process.exit(1);
	}

	console.log(chalk.bold(`Rename: ${relSource} → ${relDest}`));

	if (options.apply) {
		sourceFile.move(destPath);
		await project.save();
		console.log(chalk.green("Done"));
	} else {
		console.log(chalk.dim("Dry run. Use --apply to execute."));
	}
}
