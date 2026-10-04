export function isShortcutsSheetKey(event: KeyboardEvent): boolean {
	return (
		event.type === "keydown" &&
		(event.ctrlKey || event.metaKey) &&
		!event.altKey &&
		(event.key === "/" || event.code === "Slash")
	);
}
