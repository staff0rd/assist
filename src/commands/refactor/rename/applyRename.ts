import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { applyRewrites } from "../restructure/computeRewrites";
import type { ImportRewrite } from "../restructure/types";

export function applyRename(
	rewrites: ImportRewrite[],
	sourcePath: string,
	destPath: string,
	cwd: string,
): void {
	const updatedContents = applyRewrites(rewrites);
	for (const [file, content] of updatedContents) {
		fs.writeFileSync(file, content, "utf-8");
		console.log(chalk.cyan(`  Updated imports in ${path.relative(cwd, file)}`));
	}

	const destDir = path.dirname(destPath);
	if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
	fs.renameSync(sourcePath, destPath);
	console.log(
		chalk.white(
			`  Moved ${path.relative(cwd, sourcePath)} → ${path.relative(cwd, destPath)}`,
		),
	);
}
