import path from "node:path";
import chalk from "chalk";
import { loadProjectFile } from "../extract/loadProjectFile";

type RenameOptions = {
	apply?: boolean;
};

export async function rename(
	source: string,
	destination: string,
	options: RenameOptions = {},
): Promise<void> {
	const destPath = path.resolve(destination);
	const cwd = process.cwd();
	const relSource = path.relative(cwd, path.resolve(source));
	const relDest = path.relative(cwd, destPath);

	const { project, sourceFile } = loadProjectFile(source);

	console.log(chalk.bold(`Rename: ${relSource} → ${relDest}`));

	if (options.apply) {
		sourceFile.move(destPath);
		await project.save();
		console.log(chalk.green("Done"));
	} else {
		console.log(chalk.dim("Dry run. Use --apply to execute."));
	}
}
