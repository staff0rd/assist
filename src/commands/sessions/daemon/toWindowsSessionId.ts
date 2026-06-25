// Windows session ids are namespaced so they never collide with the WSL
// daemon's own ids in the merged session list seen by the UI.
const PREFIX = "w-";

/* why: namespacing must be idempotent. The inbound path prepends `w-` to every
 * windows-session id on each `sessions` snapshot; if a daemon version skew leaves
 * an already-prefixed id in flight, a non-idempotent prepend grows it one `w-` per
 * reconnect into `w-w-…-4`, which flooded the web-server log. Native ids are numeric
 * counters / hex uuids and never start with `w-`, so guarding the prepend is safe. */
export function toWindowsSessionId(id: string): string {
	return isWindowsSessionId(id) ? id : `${PREFIX}${id}`;
}

export function isWindowsSessionId(id: string): boolean {
	return id.startsWith(PREFIX);
}

/* why: strip every leading `w-` so an already-corrupted `w-w-…-4` collapses back to
 * its native id rather than shedding a single prefix per round-trip. */
export function stripWindowsSessionId(id: string): string {
	let stripped = id;
	while (stripped.startsWith(PREFIX)) stripped = stripped.slice(PREFIX.length);
	return stripped;
}
