import { splitFileLines } from "../../diffGaps/splitFileLines";
import { type FileRevision, fetchFileContent } from "../../fetchFileContent";

const failures = {
	absent: "the file is missing",
	"too-large": "the file is too large",
	error: "the request failed",
	loading: "the request failed",
};

export async function fetchFileLines(
	cwd: string,
	path: string,
	node: string | undefined,
	revision?: FileRevision,
): Promise<string[]> {
	const state = await fetchFileContent(cwd, path, node, revision);
	if (state.status !== "ready") throw new Error(failures[state.status]);
	return splitFileLines(state.content);
}
