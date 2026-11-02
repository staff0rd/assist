export function hunksOf(patch: string): string[] {
	const hunks: string[] = [];
	for (const line of patch.split("\n")) {
		const last = hunks[hunks.length - 1];
		if (line.startsWith("@@") || last === undefined) hunks.push(line);
		else hunks[hunks.length - 1] = `${last}\n${line}`;
	}
	return hunks;
}
