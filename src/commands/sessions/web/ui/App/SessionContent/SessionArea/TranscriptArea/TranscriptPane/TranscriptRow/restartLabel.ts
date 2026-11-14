export function restartLabel(killed: number): string {
	if (killed === 0) return "Daemon restarted";
	return `Daemon restarted · ${killed} background ${killed === 1 ? "task" : "tasks"} killed`;
}
