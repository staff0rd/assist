import { HighLevelReviewPane } from "./PrPreviewSlideInPane/HighLevelReviewPane";
import { MiroBoardPane } from "./PrPreviewSlideInPane/MiroBoardPane";
import { miroDecisionDetails } from "./miroDecisionDetails";
import { PrPreviewPane } from "./PrPreviewSlideInPane/PrPreviewPane";
import { previewPaneCapabilities } from "./PrPreviewSlideInPane/previewPaneCapabilities";
import type { PrPreviewPaneProps } from "./PrPreviewSlideInPane/PrPreviewPaneProps";
import { QuestionPane } from "./PrPreviewSlideInPane/QuestionPane";
import { ShowPane } from "./ShowPane";

export function PrPreviewSlideInPane({
	preview,
	onDecision,
	session,
	...pane
}: PrPreviewPaneProps) {
	if (previewPaneCapabilities(preview.kind).closeOnly)
		return (
			<ShowPane
				preview={preview}
				onClose={() => onDecision("reject", miroDecisionDetails())}
			/>
		);

	if (preview.kind === "miro-board")
		return <MiroBoardPane preview={preview} onDecision={onDecision} />;

	if (preview.kind === "question")
		return <QuestionPane preview={preview} onDecision={onDecision} />;

	if (preview.kind === "high-level-review")
		return (
			<HighLevelReviewPane
				preview={preview}
				session={session}
				sendInput={pane.sendInput}
				onDecision={onDecision}
			/>
		);

	return (
		<PrPreviewPane
			preview={preview}
			session={session}
			onDecision={onDecision}
			{...pane}
		/>
	);
}
