import { apiFetch } from "../../../../../apiFetch";
import { withNode } from "../../../../../withNode";
import { highLevelProgressApiPath } from "../../../../../../../../review/highLevel/progressStore/highLevelProgressApiPath";
import type {
	HighLevelPaneProgress,
	HighLevelProgressHead,
} from "../../../../../../../../review/highLevel/progressStore/StoredHighLevelProgress";

export async function fetchHighLevelProgress(
	head: HighLevelProgressHead,
	node: string | undefined,
): Promise<HighLevelPaneProgress | undefined> {
	const params = new URLSearchParams({
		repo: head.repo,
		prNumber: String(head.prNumber),
		headSha: head.headSha,
	});
	const res = await apiFetch(
		withNode(`${highLevelProgressApiPath}?${params}`, node),
	);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const body = (await res.json()) as {
		progress?: HighLevelPaneProgress | null;
	};
	return body.progress ?? undefined;
}
