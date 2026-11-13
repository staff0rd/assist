import { existsSync, statSync } from "node:fs";
import path from "node:path";

const EXTENSIONS = [".ts", ".tsx", ".json"];

export function resolveRelative(
	from: string,
	specifier: string,
): string | undefined {
	const base = path.resolve(path.dirname(from), specifier);
	const candidates = [
		base,
		...EXTENSIONS.map((ext) => base + ext),
		...EXTENSIONS.map((ext) => path.join(base, `index${ext}`)),
	];
	return candidates.find((c) => existsSync(c) && statSync(c).isFile());
}
