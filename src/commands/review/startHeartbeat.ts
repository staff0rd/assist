export function startHeartbeat(label: string, intervalMs = 15000): () => void {
	const startedAt = Date.now();
	const timer = setInterval(() => {
		const elapsed = Math.round((Date.now() - startedAt) / 1000);
		console.log(`[${label}] still running... (${elapsed}s elapsed)`);
	}, intervalMs);
	return () => clearInterval(timer);
}
