import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { applyRewrites } from "./computeRewrites";
import type { FileMove, RestructurePlan } from "./types";

function relPath(file: string): string {
	return path.relative(process.cwd(), file);
}

function stagingPath(move: FileMove, index: number): string {
	return `${move.from}.restructure-${process.pid}-${index}`;
}

function moveFiles(moves: FileMove[]): void {
	const staged = moves.map((move, i) => {
		const staging = stagingPath(move, i);
		fs.renameSync(move.from, staging);
		return { move, staging };
	});
	for (const { move, staging } of staged) {
		fs.mkdirSync(path.dirname(move.to), { recursive: true });
		fs.renameSync(staging, move.to);
		console.log(
			chalk.white(`  Moved ${relPath(move.from)} → ${relPath(move.to)}`),
		);
	}
}

function removeIfEmpty(dir: string): boolean {
	if (!fs.existsSync(dir) || fs.readdirSync(dir).length > 0) return false;
	fs.rmdirSync(dir);
	console.log(chalk.dim(`  Removed empty directory ${relPath(dir)}`));
	return true;
}

function removeEmptyDirectories(dirs: string[], scopeRoot: string): void {
	const deepestFirst = [...new Set(dirs)].sort((a, b) => b.length - a.length);
	for (let dir of deepestFirst) {
		while (dir.startsWith(`${scopeRoot}${path.sep}`) && removeIfEmpty(dir))
			dir = path.dirname(dir);
	}
}

export function executePlan(plan: RestructurePlan): void {
	for (const [file, content] of applyRewrites(plan.rewrites)) {
		fs.writeFileSync(file, content, "utf8");
		console.log(chalk.cyan(`  Rewrote imports in ${relPath(file)}`));
	}
	moveFiles(plan.moves);
	removeEmptyDirectories(
		plan.moves.map((m) => path.dirname(m.from)),
		plan.scopeRoot,
	);
}
