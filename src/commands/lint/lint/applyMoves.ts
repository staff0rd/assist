import fs from "node:fs";
import path from "node:path";
import type { Project } from "ts-morph";
import { renameExports } from "./renameExports";

type Move = { sourcePath: string; destPath: string };

function isCaseOnly(a: string, b: string): boolean {
	return a.toLowerCase() === b.toLowerCase();
}

function moveCaseInsensitive(absSource: string, absDest: string): void {
	const tmp = `${absSource}.tmp`;
	fs.renameSync(absSource, tmp);
	fs.renameSync(tmp, absDest);
}

export function applyMoves(
	project: Project,
	moves: Move[],
	cwd: string,
	emit: (line: string) => void,
): void {
	for (const { sourcePath, destPath } of moves) {
		const start = performance.now();
		const absSource = path.resolve(sourcePath);
		const absDest = path.resolve(destPath);

		for (const r of renameExports(project, absSource, absDest)) {
			emit(`  Renamed export ${r} in ${sourcePath}`);
		}

		const sourceFile = project.getSourceFile(absSource);
		if (sourceFile) sourceFile.move(absDest);

		const ms = (performance.now() - start).toFixed(0);
		const rel = `${path.relative(cwd, absSource)} → ${path.relative(cwd, absDest)}`;
		emit(`  Renamed ${rel} (${ms}ms)`);
	}

	project.saveSync();

	for (const { sourcePath, destPath } of moves) {
		const absSource = path.resolve(sourcePath);
		const absDest = path.resolve(destPath);
		if (isCaseOnly(absSource, absDest) && fs.existsSync(absSource)) {
			moveCaseInsensitive(absSource, absDest);
		}
	}
}
