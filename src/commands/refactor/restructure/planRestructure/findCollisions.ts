import path from "node:path";
import { moduleStem } from "./moduleStem";

export function findCollisions(
	targets: Map<string, string>,
	scopeRoot: string,
): string[] {
	const byModule = new Map<string, string[]>();
	for (const [file, target] of targets) {
		const key = path.join(path.dirname(target), moduleStem(target));
		byModule.set(key, [...(byModule.get(key) ?? []), file]);
	}
	return [...byModule]
		.filter(([, files]) => files.length > 1)
		.map(([key, files]) => {
			const where = path.relative(scopeRoot, path.dirname(key)) || ".";
			const sources = files.sort().map((f) => path.relative(scopeRoot, f));
			return `Basename collision in ${where}/: ${sources.join(", ")}`;
		})
		.sort();
}
