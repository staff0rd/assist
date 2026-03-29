import path from "node:path";

export function getRelativeImportPath(from: string, to: string): string {
	let rel = path
		.relative(path.dirname(from), to)
		.replace(/\.tsx?$/, "")
		.replace(/\\/g, "/");
	if (!rel.startsWith(".")) rel = `./${rel}`;
	return rel;
}
