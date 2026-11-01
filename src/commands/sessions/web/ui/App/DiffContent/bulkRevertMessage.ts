export function bulkRevertMessage(
	count: number,
	where: string,
	uncommittedOnly: boolean,
): string {
	const files = `${count} ${count === 1 ? "file" : "files"}`;
	if (uncommittedOnly)
		return `This discards only the uncommitted edits to ${files} ${where}. Their committed changes stay in the diff. This cannot be undone.`;
	return `This discards all uncommitted changes to ${files} ${where}. This cannot be undone.`;
}
