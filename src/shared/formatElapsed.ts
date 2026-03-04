export function formatElapsed(ms: number): string {
	const secs = ms / 1000;
	if (secs < 60) return `${secs.toFixed(1)}s`;
	const mins = Math.floor(secs / 60);
	const remainSecs = secs - mins * 60;
	return `${mins}m ${remainSecs.toFixed(1)}s`;
}
