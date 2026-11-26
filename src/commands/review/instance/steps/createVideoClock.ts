export function createVideoClock(
	recording: boolean,
	now: () => number = Date.now,
): () => number | undefined {
	const startedAt = now();
	return () => (recording ? now() - startedAt : undefined);
}
