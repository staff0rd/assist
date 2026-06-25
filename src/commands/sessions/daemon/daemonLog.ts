// why: a daemon that starts before any consumer attaches would lose its startup lines, so keep the most recent ones to replay on subscribe.
const RING_CAPACITY = 1000;
const ring: string[] = [];
let sink: ((line: string) => void) | undefined;

export function daemonLog(message: string): void {
	emit(`${new Date().toISOString()} [${process.pid}] ${message}`);
}

// why: a Windows daemon line arrives already formatted (its own timestamp/pid), so relay it verbatim under a [windows] tag rather than re-stamping it with this daemon's pid.
export function relayDaemonLog(line: string): void {
	emit(`[windows] ${line}`);
}

function emit(line: string): void {
	console.log(line);
	ring.push(line);
	if (ring.length > RING_CAPACITY) ring.shift();
	sink?.(line);
}

export function setDaemonLogSink(next: (line: string) => void): void {
	sink = next;
}

export function recentDaemonLogLines(): string[] {
	return [...ring];
}
