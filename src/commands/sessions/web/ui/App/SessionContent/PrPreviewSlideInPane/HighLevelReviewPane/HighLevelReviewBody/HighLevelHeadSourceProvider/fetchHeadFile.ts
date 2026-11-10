import { apiFetch } from "../../../../../../apiFetch";
import { splitFileLines } from "../../../../../diffGaps/splitFileLines";

export async function fetchHeadFile(
	repo: string,
	sha: string,
	path: string,
): Promise<string[]> {
	const params = new URLSearchParams({ repo, sha, path });
	const res = await apiFetch(`/api/github-file?${params}`);
	const body = (await res.json().catch(() => ({}))) as {
		content?: unknown;
		error?: unknown;
	};
	if (!res.ok || typeof body.content !== "string")
		throw new Error(
			typeof body.error === "string" ? body.error : `HTTP ${res.status}`,
		);
	return splitFileLines(body.content);
}
