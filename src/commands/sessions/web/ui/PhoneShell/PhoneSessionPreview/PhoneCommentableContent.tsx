import Box from "@mui/material/Box";
import { CommentSentSnackbar } from "../../App/CommentSentSnackbar";
import { PrPreviewContent } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/PrPreviewContent";
import { PhoneCommentSheet } from "./PhoneCommentSheet";
import { PhoneSelectionCommentButton } from "./PhoneSelectionCommentButton";
import { usePhoneSelectionComment } from "./usePhoneSelectionComment";
import type { usePhoneReviewPane } from "./usePhoneReviewPane";

const selectableSx = {
	flex: 1,
	minHeight: 0,
	display: "flex",
	flexDirection: "column",
	"& .markdown": { userSelect: "text", WebkitUserSelect: "text" },
} as const;

export function PhoneCommentableContent({
	review,
}: {
	review: ReturnType<typeof usePhoneReviewPane>;
}) {
	const { pane, sender } = review;
	const selection = usePhoneSelectionComment(pane.contentRef, pane.onSelect);
	return (
		<>
			<Box sx={selectableSx}>
				<PrPreviewContent
					pane={pane}
					screenshots={review.options.screenshots}
				/>
			</Box>
			<PhoneSelectionCommentButton
				rect={selection.rect}
				onComment={selection.comment}
			/>
			<PhoneCommentSheet {...review.composer} />
			<CommentSentSnackbar
				sessionName={sender.sentTo}
				onClose={sender.clearSent}
			/>
		</>
	);
}
