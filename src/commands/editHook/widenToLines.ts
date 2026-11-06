export type EditPair = { removed: string; added: string };

export function widenToLines(
	content: string,
	oldString: string,
	newString: string,
): EditPair {
	const start = oldString === "" ? -1 : content.indexOf(oldString);
	if (start < 0) return { removed: oldString, added: newString };

	const end = start + oldString.length;
	const lineStart = content.lastIndexOf("\n", start - 1) + 1;
	const newline = content.indexOf("\n", end);
	const lineEnd = newline === -1 ? content.length : newline;
	const prefix = content.slice(lineStart, start);
	const suffix = content.slice(end, lineEnd);
	return {
		removed: prefix + oldString + suffix,
		added: prefix + newString + suffix,
	};
}
