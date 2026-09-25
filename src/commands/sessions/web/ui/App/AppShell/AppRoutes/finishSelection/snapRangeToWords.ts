function isWordChar(ch: string | undefined): boolean {
	return ch !== undefined && /\S/.test(ch);
}

export function snapRangeToWords(range: Range): Range {
	const snapped = range.cloneRange();

	const { startContainer, endContainer } = snapped;
	if (startContainer.nodeType === Node.TEXT_NODE) {
		const text = startContainer.textContent ?? "";
		let start = snapped.startOffset;
		while (start > 0 && isWordChar(text[start - 1])) start--;
		snapped.setStart(startContainer, start);
	}
	if (endContainer.nodeType === Node.TEXT_NODE) {
		const text = endContainer.textContent ?? "";
		let end = snapped.endOffset;
		while (end < text.length && isWordChar(text[end])) end++;
		snapped.setEnd(endContainer, end);
	}

	return snapped;
}
