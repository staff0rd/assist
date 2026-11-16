import type { PrPreview } from "../shared/SessionInfoBase";

export function highLevelReviewHead(preview: PrPreview): string | undefined {
	if (preview.kind !== "high-level-review") return undefined;
	return preview.metadata?.find((m) => m.label === "Head")?.value;
}
