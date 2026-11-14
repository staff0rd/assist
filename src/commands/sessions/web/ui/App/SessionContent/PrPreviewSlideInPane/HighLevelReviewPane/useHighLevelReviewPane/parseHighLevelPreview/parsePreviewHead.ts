import type { HighLevelPreviewPayload } from "../../../../../../../../../review/highLevel/types";

type PreviewHead = Pick<
	HighLevelPreviewPayload,
	"repo" | "prNumber" | "headSha" | "body"
>;

const text = (value: unknown) => (typeof value === "string" ? value : "");

export function parsePreviewHead(
	parsed: Partial<HighLevelPreviewPayload>,
): PreviewHead {
	return {
		repo: text(parsed.repo),
		prNumber: typeof parsed.prNumber === "number" ? parsed.prNumber : 0,
		headSha: text(parsed.headSha),
		body: text(parsed.body),
	};
}
