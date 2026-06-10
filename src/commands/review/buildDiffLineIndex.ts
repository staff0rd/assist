type DiffLineIndex = Map<string, Set<number>>;

const FILE_HEADER = /^\+\+\+ (?:b\/)?(.+)$/;
const HUNK_HEADER = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

// why: maps each file to the RIGHT-side line numbers GitHub will accept a
// review comment on — added (+) and context ( ) lines within hunks. Lines
// outside this set (e.g. beyond a new file's length) cannot be commented on.
export function buildDiffLineIndex(diff: string): DiffLineIndex {
	const index: DiffLineIndex = new Map();
	let currentFile: string | null = null;
	let newLine = 0;

	for (const line of diff.split("\n")) {
		const fileMatch = line.match(FILE_HEADER);
		if (fileMatch) {
			currentFile = fileMatch[1] === "/dev/null" ? null : fileMatch[1];
			continue;
		}

		const hunkMatch = line.match(HUNK_HEADER);
		if (hunkMatch) {
			newLine = Number(hunkMatch[1]);
			continue;
		}

		if (currentFile === null) continue;

		if (line.startsWith("-")) continue;
		if (line.startsWith("+") || line.startsWith(" ")) {
			let set = index.get(currentFile);
			if (!set) {
				set = new Set();
				index.set(currentFile, set);
			}
			set.add(newLine);
			newLine++;
		}
	}

	return index;
}
