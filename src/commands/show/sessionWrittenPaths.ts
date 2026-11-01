import { readFileSync } from "node:fs";
import { writtenFilePaths } from "../sessions/shared/writtenFilePaths";

export function sessionWrittenPaths(transcriptPath: string): string[] {
	let text: string;
	try {
		text = readFileSync(transcriptPath, "utf8");
	} catch {
		return [];
	}
	const paths = new Set<string>();
	for (const line of text.split("\n")) {
		if (!line.includes('"tool_use"')) continue;
		try {
			for (const path of writtenFilePaths(JSON.parse(line))) paths.add(path);
		} catch {}
	}
	return [...paths];
}
