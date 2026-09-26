import { withNode } from "../../../../withNode";
import { postJson } from "../../../postJson";

export type DiffRevertFailure = { path: string; error: string };

export async function postDiffRevertAll(
	cwd: string,
	paths: string[],
	node?: string,
): Promise<DiffRevertFailure[]> {
	const body = await postJson(
		withNode(`/api/diff/revert-all?cwd=${encodeURIComponent(cwd)}`, node),
		{ paths },
		"Failed to revert files",
	);
	return Array.isArray(body.failed) ? body.failed : [];
}
