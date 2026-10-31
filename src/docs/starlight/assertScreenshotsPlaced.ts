export function assertScreenshotsPlaced(
	path: string,
	declared: Iterable<string>,
	placed: ReadonlySet<string>,
): void {
	const unplaced = [...declared].filter((file) => !placed.has(file));
	if (unplaced.length > 0)
		throw new Error(
			`${path}: declared screenshots with no ::screenshot{file="<file>"} line: ${unplaced.join(", ")}`,
		);
}
