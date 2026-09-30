import type { PrPreview, PreviewKind } from "../shared/SessionInfoBase";
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
		draft: kind === "pr" && prNumber === null ? draft : undefined,
		metadata: parsePreviewMetadata(d.metadata),
	};
}
