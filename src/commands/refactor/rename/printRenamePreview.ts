import path from "node:path";
import chalk from "chalk";
import type { ImportRewrite } from "../restructure/types";

export function printRenamePreview(
	rewrites: ImportRewrite[],
	cwd: string,
): void {
	for (const rewrite of rewrites) {
		console.log(
			chalk.dim(
				`  ${path.relative(cwd, rewrite.file)}: ${rewrite.oldSpecifier} → ${rewrite.newSpecifier}`,
			),
		);
	}
	console.log(chalk.dim("Dry run. Use --apply to execute."));
}
