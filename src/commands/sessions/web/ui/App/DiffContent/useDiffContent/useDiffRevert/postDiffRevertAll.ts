import { postJson } from "../../../postJson";

export type DiffRevertFailure = { path: string; error: string };

export async function postDiffRevertAll(
	cwd: string,
	paths: string[],
): Promise<DiffRevertFailure[]> {
	const body = await postJson(
		`/api/diff/revert-all?cwd=${encodeURIComponent(cwd)}`,
		{ paths },
		"Failed to revert files",
	);
	return Array.isArray(body.failed) ? body.failed : [];
}
