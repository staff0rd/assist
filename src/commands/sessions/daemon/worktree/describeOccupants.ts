import type { Occupant } from "./readOccupant";

export function describeOccupants(occupants: Occupant[]): string | undefined {
	if (occupants.length === 0) return undefined;
	const vscode = occupants.filter((o) => o.vscode).map((o) => o.pid);
	const others = new Map<string, number[]>();
	for (const o of occupants) {
		if (o.vscode) continue;
		others.set(o.name, [...(others.get(o.name) ?? []), o.pid]);
	}
	const parts: string[] = [];
	if (vscode.length > 0)
		parts.push(`VS Code has this worktree open (${pidList(vscode)})`);
	if (others.size > 0) {
		const programs = [...others].map(
			([name, pids]) => `${name} (${pidList(pids)})`,
		);
		parts.push(`a live process is still running in it: ${programs.join(", ")}`);
	}
	return parts.join("; ");
}

function pidList(pids: number[]): string {
	return `pid ${[...pids].sort((a, b) => a - b).join(", ")}`;
}
