const HUNK_HEADER = /^@@ -\d+(?:,\d+)? \+(\d+)/;

export function patchAddedLines(patch: string): Set<number> {
	const added = new Set<number>();
	let next = 0;
	for (const line of patch.split("\n")) {
		const header = HUNK_HEADER.exec(line);
		if (header) next = Number(header[1]);
		else if (line.startsWith("+")) added.add(next++);
		else if (!line.startsWith("-") && !line.startsWith("\\")) next++;
	}
	return added;
}
