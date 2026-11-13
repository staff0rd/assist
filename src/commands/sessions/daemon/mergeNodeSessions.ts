import type { SessionInfo } from "./createSession";

/* why: interleave nodes by start time so a new session lands after every
 * existing card in its repo group, while each node's own order is kept. */
export function mergeNodeSessions(
	local: SessionInfo[],
	linked: SessionInfo[],
): SessionInfo[] {
	const byNode = new Map<string | undefined, SessionInfo[]>([
		[undefined, [...local]],
	]);
	for (const session of linked) {
		const list = byNode.get(session.node);
		if (list) list.push(session);
		else byNode.set(session.node, [session]);
	}
	const queues = [...byNode.values()];
	const merged: SessionInfo[] = [];
	for (;;) {
		let next: SessionInfo[] | undefined;
		for (const queue of queues) {
			if (queue.length === 0) continue;
			if (!next || queue[0]!.startedAt < next[0]!.startedAt) next = queue;
		}
		if (!next) return merged;
		merged.push(next.shift()!);
	}
}
