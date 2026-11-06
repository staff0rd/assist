import type { PrPreview, PreviewKind } from "../shared/SessionInfoBase";
import { toAttachments } from "../shared/toAttachments";
import { parsePreviewMetadata } from "./parsePreviewMetadata";

export function buildPrPreview(
	d: Record<string, unknown>,
	kind: PreviewKind,
	prNumber: number | null,
): PrPreview {
	const draft = d.draft === true;
	return {
		requestId: d.requestId as string,
		title: d.title as string,
		body: d.body as string,
		prNumber,
		kind,
		itemType:
			kind === "backlog-item"
				? d.itemType === "bug"
					? "bug"
					: "story"
				: undefined,
		canStart: kind === "backlog-item" && d.canStart === true ? true : undefined,
		draft: kind === "pr" && prNumber === null ? draft : undefined,
		reviewAfter:
			kind === "pr" && typeof d.reviewAfter === "boolean"
				? d.reviewAfter
				: undefined,
		metadata: parsePreviewMetadata(d.metadata),
		screenshots: kind === "pr" ? toAttachments(d.screenshots) : undefined,
	};
}
