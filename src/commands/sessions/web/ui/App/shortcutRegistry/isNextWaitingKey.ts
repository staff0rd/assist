export function isNextWaitingKey(event: KeyboardEvent): boolean {
	return (
		event.type === "keydown" &&
		(event.ctrlKey || event.metaKey) &&
		!event.shiftKey &&
		!event.altKey &&
		event.key === "."
	);
}
