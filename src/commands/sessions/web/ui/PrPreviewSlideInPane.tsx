import { HighLevelReviewPane } from "./HighLevelReviewPane";
import { MiroBoardPane } from "./MiroBoardPane";
import { PrPreviewPane } from "./PrPreviewPane";
import type { PrPreviewPaneProps } from "./PrPreviewPaneProps";

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
