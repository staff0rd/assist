import path from "node:path";

export function lowestCommonAncestor(dirs: string[]): string {
	const [first, ...rest] = dirs.map((d) => d.split(path.sep));
	let common = first;
	for (const parts of rest) {
		let i = 0;
		while (i < common.length && i < parts.length && common[i] === parts[i]) i++;
		common = common.slice(0, i);
	}
	return common.join(path.sep) || path.sep;
}
