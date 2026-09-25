import path from "node:path";

export function moduleStem(file: string): string {
	return path.basename(file).replace(/\.tsx?$/, "");
}
