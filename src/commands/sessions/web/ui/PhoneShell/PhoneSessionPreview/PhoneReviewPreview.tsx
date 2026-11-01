import { useState } from "react";
import type { PrPreview } from "../../../../shared/SessionInfoBase";
import { PhonePreviewCard } from "../PhonePreviewCard";
import { previewKindLabel } from "../PhonePreviewCard/previewKindLabel";
import { PhonePreviewDecisions } from "../PhonePreviewDecisions";
import { PhoneReviewSheet } from "../PhoneReviewSheet";
import type { PhonePreviewProps } from "./PhonePreviewProps";
import { PhoneReviewSheetBody } from "./PhoneReviewSheetBody";
import { usePhoneReviewPane } from "./usePhoneReviewPane";

function reviewLabel(preview: PrPreview) {
	return preview.kind === "backlog-item" ? "Review full item" : "Review";
}

export function PhoneReviewPreview(props: PhonePreviewProps) {
	const { preview, keyboardOpen } = props;
	const [open, setOpen] = useState(false);
	const review = usePhoneReviewPane(props);

	return (
		<>
			<PhonePreviewCard
				preview={preview}
				keyboardOpen={keyboardOpen}
				reviewLabel={reviewLabel(preview)}
				onReview={() => setOpen(true)}
				actions={<PhonePreviewDecisions {...review.decisions} />}
			/>
			<PhoneReviewSheet
				open={open}
				title={previewKindLabel(preview)}
				onClose={() => setOpen(false)}
			>
				<PhoneReviewSheetBody preview={preview} review={review} />
			</PhoneReviewSheet>
		</>
	);
}
