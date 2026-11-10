import { type FileData, parseDiff } from "react-diff-view";

function trimGitNameTab(path: string): string {
	return path.replace(/\t$/, "");
}

// gitdiff-parser consumes the "Binary files ... differ" line as part of the file header, so it never sets isBinary itself.
function binaryFlags(diff: string): boolean[] {
	const flags: boolean[] = [];
	let inHeader = false;
	for (const line of diff.split("\n")) {
		if (line.startsWith("diff --git")) {
			flags.push(false);
			inHeader = true;
		} else if (line.startsWith("@@")) {
			inHeader = false;
		} else if (
			inHeader &&
			(line.startsWith("Binary files ") || line === "GIT binary patch")
		) {
			flags[flags.length - 1] = true;
		}
	}
	return flags;
}

export function parseDiffFiles(diff: string): FileData[] {
	const binary = binaryFlags(diff);
	return parseDiff(diff).map((file, index) => ({
		...file,
		oldPath: trimGitNameTab(file.oldPath),
		newPath: trimGitNameTab(file.newPath),
		...(binary[index] ? { isBinary: true } : {}),
	}));
}
