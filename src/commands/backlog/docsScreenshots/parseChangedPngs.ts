import { basename } from "node:path";

export function parseChangedPngs(porcelain: string): Set<string> {
	const changed = new Set<string>();
	for (const line of porcelain.split("\n")) {
		if (line.length < 4 || line.slice(0, 2).includes("D")) continue;
		const path =
			line.slice(3).split(" -> ").at(-1)?.replace(/^"|"$/g, "") ?? "";
		if (path.endsWith(".png")) changed.add(basename(path));
	}
	return changed;
}
