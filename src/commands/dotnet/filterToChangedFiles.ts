import type { Issue } from "./parseInspectReport";

export function filterToChangedFiles(
	issues: Issue[],
	changedFiles: string[],
): Issue[] {
	const normalize = (f: string) =>
		f.replace(/\\/g, "/").replace(/^file:\/\/\//, "");
	const changed = changedFiles.map(normalize);
	return issues.filter((i) => {
		const file = normalize(i.file);
		return changed.some((c) => file === c || file.endsWith(`/${c}`));
	});
}
