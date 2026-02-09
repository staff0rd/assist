import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { applyRewrites } from "./computeRewrites";
import type { RestructurePlan } from "./types";

export function executePlan(plan: RestructurePlan): void {
	const updatedContents = applyRewrites(plan.rewrites);

	for (const [file, content] of updatedContents) {
		fs.writeFileSync(file, content, "utf-8");
		console.log(
			chalk.cyan(`  Rewrote imports in ${path.relative(process.cwd(), file)}`),
		);
	}

	for (const dir of plan.newDirectories) {
		fs.mkdirSync(dir, { recursive: true });
		console.log(chalk.green(`  Created ${path.relative(process.cwd(), dir)}/`));
	}

	for (const move of plan.moves) {
		const targetDir = path.dirname(move.to);
		if (!fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir, { recursive: true });
		}
		fs.renameSync(move.from, move.to);
		console.log(
			chalk.white(
				`  Moved ${path.relative(process.cwd(), move.from)} → ${path.relative(process.cwd(), move.to)}`,
			),
		);
	}

	removeEmptyDirectories(plan.moves.map((m) => path.dirname(m.from)));
}

function removeEmptyDirectories(dirs: string[]): void {
	const unique = [...new Set(dirs)];
	for (const dir of unique) {
		if (!fs.existsSync(dir)) continue;
		const entries = fs.readdirSync(dir);
		if (entries.length === 0) {
			fs.rmdirSync(dir);
			console.log(
				chalk.dim(
					`  Removed empty directory ${path.relative(process.cwd(), dir)}`,
				),
			);
		}
	}
}
