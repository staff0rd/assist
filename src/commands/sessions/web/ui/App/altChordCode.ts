export function altChordCode(event: KeyboardEvent): string | undefined {
	if (
		event.type !== "keydown" ||
		!event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		event.shiftKey
	)
		return undefined;
	return event.code;
}
