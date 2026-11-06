import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import type { PrPreview } from "../../../../shared/SessionInfoBase";
import { PrPreviewHeader } from "../../App/SessionContent/PrPreviewHeader";
import { PreviewMetadataList } from "../../App/SessionContent/PrPreviewSlideInPane/PreviewMetadataList";
import { PrPreviewChainToggles } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/PrPreviewFooter/PrPreviewActions/PrPreviewChainToggles";
import { PhonePreviewDecisions } from "../PhonePreviewDecisions";
import { PhoneCommentableContent } from "./PhoneCommentableContent";
import { PhoneRejectReason } from "./PhoneRejectReason";
import type { usePhoneReviewPane } from "./usePhoneReviewPane";

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

export function PhoneReviewSheetBody({
	preview,
	review,
}: {
	preview: PrPreview;
	review: ReturnType<typeof usePhoneReviewPane>;
}) {
	const { options, pane } = review;
	return (
		<>
			<PrPreviewHeader preview={preview} draft={pane.chain.draft} />
			<PreviewMetadataList items={preview.metadata ?? []} />
			<Divider />
			<PhoneCommentableContent review={review} />
			<Box sx={footerSx}>
				{options.isPr && (
					<PrPreviewChainToggles
						chain={pane.chain}
						newPr={preview.prNumber === null}
						onChange={pane.setChain}
					/>
				)}
				<PhoneRejectReason value={review.reason} onChange={review.setReason} />
				<PhonePreviewDecisions {...review.decisions} />
			</Box>
		</>
	);
}
