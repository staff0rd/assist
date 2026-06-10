const FILE_HEADER = /^\+\+\+ (?:b\/)?(.+)$/;
const HUNK_HEADER = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
const GUTTER_WIDTH = 6;

function gutter(lineNumber: number | null): string {
	const label = lineNumber === null ? "" : String(lineNumber);
	return `${label.padStart(GUTTER_WIDTH, " ")}  `;
}

// why: reviewers read the diff and infer file/line citations from it. Given a raw
// unified diff, models tend to cite the line's position within the request
// document rather than its real line in the file, producing citations that fall
// outside the diff and get dropped. Prefixing each RIGHT-side line (added/context)
// with its actual new-file line number removes that ambiguity — the model copies
// the gutter number instead of counting. Removed lines get a blank gutter to
// signal they cannot be commented on.
export function annotateDiffWithLineNumbers(diff: string): string {
	let inFile = false;
	let newLine = 0;

	return diff
		.split("\n")
		.map((line) => {
			if (FILE_HEADER.test(line)) {
				inFile = true;
				return gutter(null) + line;
			}

			const hunkMatch = line.match(HUNK_HEADER);
			if (hunkMatch) {
				newLine = Number(hunkMatch[1]);
				return gutter(null) + line;
			}

			if (!inFile) return gutter(null) + line;

			if (line.startsWith("+") || line.startsWith(" ")) {
				const annotated = gutter(newLine) + line;
				newLine++;
				return annotated;
			}

			return gutter(null) + line;
		})
		.join("\n");
}
