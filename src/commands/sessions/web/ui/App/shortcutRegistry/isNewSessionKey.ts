export function isNewSessionKey(event: KeyboardEvent): boolean {
	const ctrlOrMeta = event.ctrlKey || event.metaKey;
	return (
		event.type === "keydown" &&
		ctrlOrMeta !== event.altKey &&
		!event.shiftKey &&
		// macOS Option+N yields a dead-key "˜", so fall back to the physical key
		(event.key.toLowerCase() === "n" || event.code === "KeyN")
	);
}
