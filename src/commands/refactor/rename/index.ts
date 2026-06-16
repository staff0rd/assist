import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { applyRename } from "./applyRename";
import { computeRenameRewrites } from "./computeRenameRewrites";
import { printRenamePreview } from "./printRenamePreview";

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

	if (!fs.existsSync(sourcePath)) {
		console.log(chalk.red(`File not found: ${source}`));
		process.exit(1);
	}
	if (destPath !== sourcePath && fs.existsSync(destPath)) {
		console.log(chalk.red(`Destination already exists: ${destination}`));
		process.exit(1);
	}

	console.log(chalk.bold(`Rename: ${relSource} → ${relDest}`));

	console.log(chalk.dim("Loading project..."));
	console.log(chalk.dim("Scanning imports across the project..."));
	const rewrites = computeRenameRewrites(sourcePath, destPath);
	const affectedFiles = new Set(rewrites.map((r) => r.file)).size;

	console.log(
		chalk.dim(
			`${rewrites.length} import path(s) to update across ${affectedFiles} file(s)`,
		),
	);

	if (!options.apply) {
		printRenamePreview(rewrites, cwd);
		return;
	}

	applyRename(rewrites, sourcePath, destPath, cwd);
	console.log(chalk.green("Done"));
}
