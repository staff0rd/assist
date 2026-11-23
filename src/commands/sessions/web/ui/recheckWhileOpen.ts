/** Runs check now, every intervalMs and on window focus; returns the cleanup. */
export function recheckWhileOpen(
	check: () => unknown,
	intervalMs: number,
): () => void {
	void check();
	const timer = setInterval(check, intervalMs);
	globalThis.addEventListener("focus", check);
	return () => {
		clearInterval(timer);
		globalThis.removeEventListener("focus", check);
	};
}
