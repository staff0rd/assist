const held = new WeakSet<object>();

/** Run `fn` with parked-run wakes suspended for this session map. */
export function holdingWakes<T>(sessions: object, fn: () => T): T {
	held.add(sessions);
	try {
		return fn();
	} finally {
		held.delete(sessions);
	}
}

export function wakesHeld(sessions: object): boolean {
	return held.has(sessions);
}
