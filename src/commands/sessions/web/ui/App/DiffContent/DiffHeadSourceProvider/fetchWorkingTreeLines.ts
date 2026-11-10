import { splitFileLines } from "../../diffGaps/splitFileLines";
import { fetchFileContent } from "../../fetchFileContent";

const failures = {
	absent: "the file is missing",
	"too-large": "the file is too large",
	error: "the request failed",
	loading: "the request failed",
};

export async function fetchWorkingTreeLines(
	cwd: string,
	path: string,
	node: string | undefined,
): Promise<string[]> {
	const state = await fetchFileContent(cwd, path, node);
	if (state.status !== "ready") throw new Error(failures[state.status]);
	return splitFileLines(state.content);
}
