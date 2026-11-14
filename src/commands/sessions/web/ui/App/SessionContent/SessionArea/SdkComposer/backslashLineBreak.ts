export function backslashLineBreak(field: HTMLTextAreaElement) {
	const { value, selectionStart: start, selectionEnd: end } = field;
	if (start !== end || start === 0 || value[start - 1] !== "\\") return null;
	return {
		text: `${value.slice(0, start - 1)}\n${value.slice(start)}`,
		cursor: start,
	};
}
