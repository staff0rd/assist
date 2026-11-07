import Divider from "@mui/material/Divider";
import type { PrPreview } from "../../../../shared/SessionInfoBase";
import { PrPreviewHeader } from "../../App/SessionContent/PrPreviewHeader";
import { PreviewMetadataList } from "../../App/SessionContent/PrPreviewSlideInPane/PreviewMetadataList";
import { PhoneCommentableContent } from "./PhoneCommentableContent";
import { PhoneReviewFooter } from "./PhoneReviewSheetBody/PhoneReviewFooter";
import type { usePhoneReviewPane } from "./usePhoneReviewPane";

export function PhoneReviewSheetBody({
	preview,
	review,
}: {
	preview: PrPreview;
	review: ReturnType<typeof usePhoneReviewPane>;
}) {
	return (
		<>
			<PrPreviewHeader preview={preview} draft={review.pane.chain.draft} />
			<PreviewMetadataList items={preview.metadata ?? []} />
			<Divider />
			<PhoneCommentableContent review={review} />
			<PhoneReviewFooter preview={preview} review={review} />
		</>
	);
}
