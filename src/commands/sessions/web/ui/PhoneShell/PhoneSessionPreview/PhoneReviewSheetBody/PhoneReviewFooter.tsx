import Box from "@mui/material/Box";
import { useState } from "react";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { PrPreviewChainToggles } from "../../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/PrPreviewFooter/PrPreviewActions/PrPreviewChainToggles";
import { PhonePreviewDecisions } from "../../PhonePreviewDecisions";
import { PhoneRejectReason } from "../PhoneRejectReason";
import { PhoneReviewCommentList } from "../PhoneReviewCommentList";
import { PhoneReviewCommentsLink } from "../PhoneReviewCommentsLink";
import type { usePhoneReviewPane } from "../usePhoneReviewPane";

const footerSx = {
	flex: "none",
	display: "flex",
	flexDirection: "column",
	gap: 1.25,
	px: 2,
	pt: 1.5,
	pb: 2,
	borderTop: 1,
	borderColor: "divider",
} as const;

export function PhoneReviewFooter({
	preview,
	review,
}: {
	preview: PrPreview;
	review: ReturnType<typeof usePhoneReviewPane>;
}) {
	const { options, pane } = review;
	const [listOpen, setListOpen] = useState(false);
	return (
		<>
			<Box sx={footerSx}>
				{options.isPr && (
					<PrPreviewChainToggles
						chain={pane.chain}
						newPr={preview.prNumber === null}
						onChange={pane.setChain}
					/>
				)}
				<PhoneRejectReason value={review.reason} onChange={review.setReason} />
				<PhoneReviewCommentsLink
					count={pane.comments.length}
					onOpen={() => setListOpen(true)}
				/>
				<PhonePreviewDecisions {...review.decisions} />
			</Box>
			<PhoneReviewCommentList
				open={listOpen}
				comments={pane.comments}
				colors={pane.commentColors}
				onClose={() => setListOpen(false)}
				onRemove={pane.remove}
				decisions={review.decisions}
			/>
		</>
	);
}
