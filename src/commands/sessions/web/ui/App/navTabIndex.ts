const NAV_TAB_DIGIT = /^Digit([1-5])$/;

export function navTabIndex(event: KeyboardEvent): number | undefined {
	if (
		event.type !== "keydown" ||
		!event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		event.shiftKey
	)
		return undefined;
	const match = NAV_TAB_DIGIT.exec(event.code);
	return match ? Number(match[1]) - 1 : undefined;
}
