export function formatToolElapsed(seconds: number): string {
	const total = Math.max(0, Math.floor(seconds));
	if (total < 60) return `${total}s`;
	const mins = Math.floor(total / 60);
	if (mins < 60) return `${mins}m ${total % 60}s`;
	return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
