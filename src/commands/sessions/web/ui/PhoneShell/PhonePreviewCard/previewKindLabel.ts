import type { PrPreview } from "../../../../shared/SessionInfoBase";
import { previewChip } from "../../App/SessionContent/PrPreviewHeader/previewChip";

export function previewKindLabel(preview: PrPreview): string {
	if (preview.kind === "backlog-item")
		return `Backlog item · ${preview.itemType ?? "story"}`;
	return previewChip(preview, preview.draft === true).label;
}
