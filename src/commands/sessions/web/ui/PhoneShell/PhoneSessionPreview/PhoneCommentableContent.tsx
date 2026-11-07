import Box from "@mui/material/Box";
import { CommentSentSnackbar } from "../../App/CommentSentSnackbar";
import { PrPreviewContent } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/PrPreviewContent";
import { CommentQueuedToast } from "./CommentQueuedToast";
import { commentableContentSx } from "./PhoneCommentableContent/commentableContentSx";
import { useHighlightPeek } from "./PhoneCommentableContent/useHighlightPeek";
import { PhoneCommentComposer } from "./PhoneCommentComposer";
import { PhoneCommentPeek } from "./PhoneCommentPeek";
import { PhoneSelectionCommentBar } from "./PhoneSelectionCommentBar";
import { usePhoneSelectionComment } from "./usePhoneSelectionComment";
import type { usePhoneReviewPane } from "./usePhoneReviewPane";

export function PhoneCommentableContent({
	review,
}: {
	review: ReturnType<typeof usePhoneReviewPane>;
}) {
	const { pane, sender, undo } = review;
	const { onTap, selectOrOpen, peek } = useHighlightPeek(review);
	const selection = usePhoneSelectionComment(pane.contentRef, selectOrOpen);
	return (
		<>
			<Box sx={commentableContentSx} onClick={onTap}>
				<PrPreviewContent
					pane={pane}
					screenshots={review.options.screenshots}
				/>
			</Box>
			<PhoneSelectionCommentBar
				open={selection.showBar}
				onComment={selection.comment}
			/>
			<PhoneCommentComposer {...review.composer} />
			<PhoneCommentPeek {...peek} />
			<CommentQueuedToast {...undo} />
			<CommentSentSnackbar
				sessionName={sender.sentTo}
				onClose={sender.clearSent}
			/>
		</>
	);
}
