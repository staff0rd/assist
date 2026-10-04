export function isCycleCardKey(event: KeyboardEvent): boolean {
	return (
		event.key === "Tab" && !event.ctrlKey && !event.altKey && !event.metaKey
	);
}
