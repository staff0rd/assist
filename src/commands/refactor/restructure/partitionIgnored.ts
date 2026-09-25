import path from "node:path";
import { minimatch } from "minimatch";
import { loadConfig } from "../../../shared/loadConfig";

export function partitionIgnored(files: string[]): {
	scoped: string[];
	ignored: string[];
} {
	const globs = loadConfig().restructure?.ignore ?? [];
	const isIgnored = (file: string) =>
		globs.some((glob) => minimatch(path.relative(process.cwd(), file), glob));
	return {
		scoped: files.filter((f) => !isIgnored(f)),
		ignored: files.filter(isIgnored),
	};
}
