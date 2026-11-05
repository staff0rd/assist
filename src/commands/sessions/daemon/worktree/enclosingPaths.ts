import { isAbsolute, relative } from "node:path";

function isWithin(dir: string, parent: string): boolean {
	const rel = relative(parent, dir);
	return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

export function enclosingPaths(dirs: string[]): number[][] {
	return dirs.map((dir, i) =>
		dirs.slice(0, i).flatMap((other, j) => (isWithin(dir, other) ? [j] : [])),
	);
}
