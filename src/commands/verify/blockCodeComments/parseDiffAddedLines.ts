type AddedLines = Map<string, Set<number>>;

const FILE_HEADER = /^\+\+\+ (?:b\/)?(.+)$/;
const HUNK_HEADER = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

export function parseDiffAddedLines(diff: string): AddedLines {
	const added: AddedLines = new Map();
	let currentFile: string | null = null;
	let newLine = 0;

	for (const line of diff.split("\n")) {
		const fileMatch = line.match(FILE_HEADER);
		if (fileMatch) {
			const file = fileMatch[1];
			currentFile = file === "/dev/null" ? null : file;
			continue;
		}

		const hunkMatch = line.match(HUNK_HEADER);
		if (hunkMatch) {
			newLine = Number(hunkMatch[1]);
			continue;
		}

		if (currentFile === null) continue;

		if (line.startsWith("+")) {
			let set = added.get(currentFile);
			if (!set) {
				set = new Set();
				added.set(currentFile, set);
			}
			set.add(newLine);
			newLine++;
		} else if (!line.startsWith("-")) {
			newLine++;
		}
	}

	return added;
}
