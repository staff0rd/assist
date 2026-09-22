import type { ReleaseNode } from "../../../../shared/types";
import { normaliseJobName, releaseJobTokens } from "./releaseJobTokens";
import { runJobState, UNREACHED_BY_RUN } from "./runJobState";
import type { ReleaseRunJob } from "./runJobs";
import type { ReleaseRunNodeState } from "./types";

type Candidate = { node: ReleaseNode; tokens: string[] };

function mostSpecificFirst(nodes: ReleaseNode[]): Candidate[] {
	return nodes
		.map((node, index) => ({ node, index, tokens: releaseJobTokens(node) }))
		.sort(
			(a, b) =>
				(b.tokens[0]?.length ?? 0) - (a.tokens[0]?.length ?? 0) ||
				a.index - b.index,
		);
}

function firstUnclaimed(
	names: string[],
	claimed: Set<number>,
	tokens: string[],
): number | undefined {
	for (const token of tokens)
		for (const [index, name] of names.entries())
			if (!claimed.has(index) && name.includes(token)) return index;
	return undefined;
}

export function matchRunJobs(
	nodes: ReleaseNode[],
	jobs: ReleaseRunJob[],
): Map<string, ReleaseRunNodeState> {
	const names = jobs.map((job) => normaliseJobName(job.name));
	const claimed = new Set<number>();
	const matched = new Map<string, ReleaseRunNodeState>();
	for (const { node, tokens } of mostSpecificFirst(nodes)) {
		const hit = firstUnclaimed(names, claimed, tokens);
		const job = hit === undefined ? undefined : jobs[hit];
		if (hit !== undefined) claimed.add(hit);
		matched.set(node.id, job ? runJobState(job) : UNREACHED_BY_RUN);
	}
	return matched;
}
