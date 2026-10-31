const reported = new WeakSet<object>();

export function markReported(reason: unknown): void {
	if (typeof reason === "object" && reason !== null) reported.add(reason);
}

export function wasReported(reason: unknown): boolean {
	return typeof reason === "object" && reason !== null && reported.has(reason);
}
