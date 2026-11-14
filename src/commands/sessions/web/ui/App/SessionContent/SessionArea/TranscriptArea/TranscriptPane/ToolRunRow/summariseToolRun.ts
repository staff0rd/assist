const EDIT_TOOLS = new Set([
	"Edit",
	"MultiEdit",
	"Write",
	"NotebookEdit",
	"apply_patch",
]);

const PATCH_FILE = /\*\*\* (?:Add|Update|Delete) File: (\S+)/g;

export type ToolRunSummary = {
	count: number;
	edited: string[];
	read: string[];
	tools: string;
};

function editedPaths(tool: string, target: string): string[] {
	if (tool !== "apply_patch") return [target];
	const patched = [...target.matchAll(PATCH_FILE)].map((m) => m[1]);
	return patched.length > 0 ? patched : target.split(", ");
}

export function summariseToolRun(
	calls: { tool: string; target?: string }[],
): ToolRunSummary {
	const edited = new Set<string>();
	const read = new Set<string>();
	const counts = new Map<string, number>();
	for (const { tool, target } of calls) {
		const path = target?.trim();
		if (path && EDIT_TOOLS.has(tool)) {
			for (const p of editedPaths(tool, path)) if (p) edited.add(p);
		} else if (path && tool === "Read") read.add(path);
		else counts.set(tool, (counts.get(tool) ?? 0) + 1);
	}
	return {
		count: calls.length,
		edited: [...edited],
		read: [...read].filter((p) => !edited.has(p)),
		tools: [...counts]
			.map(([tool, n]) => (n > 1 ? `${tool} ×${n}` : tool))
			.join(", "),
	};
}
