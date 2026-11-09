import type { HighLevelPreviewPayload } from "../../../../../../../../review/highLevel/types";

export function highLevelProgressHead(
	payload: Pick<HighLevelPreviewPayload, "repo" | "prNumber" | "headSha">,
): string | undefined {
	if (!payload.repo || !payload.headSha) return undefined;
	return `${payload.repo}#${payload.prNumber}@${payload.headSha}`;
}
