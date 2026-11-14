import type { ProcStat } from "./readProcStat";

type Ranked = { stat: ProcStat; depth: number };

// why: among siblings started together (a pipeline), the lower pid is the producing stage rather than a `| tail` sink
function outranks(stat: ProcStat, depth: number, best: Ranked): boolean {
	if (depth !== best.depth) return depth > best.depth;
	if (stat.startTicks !== best.stat.startTicks)
		return stat.startTicks > best.stat.startTicks;
	return stat.pid < best.stat.pid;
}

export function findLeafProcess(
	stats: readonly ProcStat[],
	rootPid: number,
	minStartTicks: number,
): ProcStat | undefined {
	const children = new Map<number, ProcStat[]>();
	for (const stat of stats) {
		const siblings = children.get(stat.ppid) ?? [];
		siblings.push(stat);
		children.set(stat.ppid, siblings);
	}
	let best: Ranked | undefined;
	const walk = (pid: number, depth: number) => {
		for (const child of children.get(pid) ?? []) {
			if (child.state === "Z") continue;
			if (
				child.startTicks >= minStartTicks &&
				(!best || outranks(child, depth, best))
			)
				best = { stat: child, depth };
			walk(child.pid, depth + 1);
		}
	};
	walk(rootPid, 1);
	return best?.stat;
}
