export type GitStatusCounts = {
	new: string[];
	modified: string[];
	deleted: string[];
};

function extractPath(rest: string): string {
	const arrow = rest.indexOf(" -> ");
	return arrow === -1 ? rest : rest.slice(arrow + 4);
}

function categorize(xy: string): keyof GitStatusCounts | null {
	if (xy === "??") return "new";
	const codes = xy.replace(/ /g, "");
	if (codes.includes("A")) return "new";
	if (codes.includes("D")) return "deleted";
	if (codes.includes("M") || codes.includes("R") || codes.includes("C")) {
		return "modified";
	}
	return null;
}

export function parseGitStatus(output: string): GitStatusCounts {
	const result: GitStatusCounts = { new: [], modified: [], deleted: [] };
	for (const line of output.split("\n")) {
		if (line.length < 4) continue;
		const category = categorize(line.slice(0, 2));
		if (category) result[category].push(extractPath(line.slice(3)));
	}
	return result;
}
