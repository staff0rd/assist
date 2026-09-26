// why: a daemon that starts before any consumer attaches would lose its startup lines, so keep the most recent ones to replay on subscribe.
const RING_CAPACITY = 1000;
type LogEntry = { line: string; relayed: boolean };
const ring: LogEntry[] = [];
let sink: ((line: string, relayed: boolean) => void) | undefined;

export function daemonLog(message: string): void {
	emit(`${new Date().toISOString()} [${process.pid}] ${message}`, false);
}

// why: a linked node's line arrives already formatted (its own timestamp/pid), so relay it verbatim under its [<node>] tag; relayed lines are marked so they are never re-exported to peers.
export function relayDaemonLog(node: string, line: string): void {
	emit(`[${node}] ${line}`, true);
}

function emit(line: string, relayed: boolean): void {
	console.log(line);
	ring.push({ line, relayed });
	if (ring.length > RING_CAPACITY) ring.shift();
	sink?.(line, relayed);
}

export function setDaemonLogSink(
	next: (line: string, relayed: boolean) => void,
): void {
	sink = next;
}

export function recentDaemonLogLines(includeRelayed = true): string[] {
	return ring
		.filter((entry) => includeRelayed || !entry.relayed)
		.map((entry) => entry.line);
}
