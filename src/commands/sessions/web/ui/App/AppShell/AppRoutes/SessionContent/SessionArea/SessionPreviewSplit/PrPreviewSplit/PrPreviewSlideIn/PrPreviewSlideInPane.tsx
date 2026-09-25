import { HighLevelReviewPane } from "./PrPreviewSlideInPane/HighLevelReviewPane";
import { MiroBoardPane } from "./PrPreviewSlideInPane/MiroBoardPane";
import { PrPreviewPane } from "./PrPreviewSlideInPane/PrPreviewPane";
import type { PrPreviewPaneProps } from "./PrPreviewSlideInPane/PrPreviewPaneProps";

export function PrPreviewSlideInPane({
	preview,
	onDecision,
	...pane
}: PrPreviewPaneProps) {
	if (preview.kind === "miro-board")
		return <MiroBoardPane preview={preview} onDecision={onDecision} />;

	if (preview.kind === "high-level-review")
		return <HighLevelReviewPane preview={preview} onDecision={onDecision} />;

	return <PrPreviewPane preview={preview} onDecision={onDecision} {...pane} />;
}
