import Button from "@mui/material/Button";
import { useState } from "react";
import { miroDecisionDetails } from "../../App/SessionContent/miroDecisionDetails";
import { PrPreviewSlideInPane } from "../../App/SessionContent/PrPreviewSlideInPane";
import { previewPaneCapabilities } from "../../App/SessionContent/PrPreviewSlideInPane/previewPaneCapabilities";
import { PhonePreviewCard } from "../PhonePreviewCard";
import { previewKindLabel } from "../PhonePreviewCard/previewKindLabel";
import { PhoneReviewSheet } from "../PhoneReviewSheet";
import type { PhonePreviewProps } from "./PhonePreviewProps";

const closeSx = { borderRadius: "12px", fontWeight: 600 } as const;

export function PhonePanePreview({
	preview,
	session,
	keyboardOpen,
	sendInput,
	onDecision,
}: PhonePreviewProps) {
	const [open, setOpen] = useState(false);
	const closeOnly = previewPaneCapabilities(preview.kind).closeOnly;

	return (
		<>
			<PhonePreviewCard
				preview={preview}
				keyboardOpen={keyboardOpen}
				reviewLabel={closeOnly ? "View" : "Review"}
				onReview={() => setOpen(true)}
				actions={
					closeOnly && (
						<Button
							variant="contained"
							disableElevation
							sx={closeSx}
							onClick={() => onDecision("reject", miroDecisionDetails())}
						>
							Close
						</Button>
					)
				}
			/>
			<PhoneReviewSheet
				open={open}
				title={previewKindLabel(preview)}
				onClose={() => setOpen(false)}
			>
				<PrPreviewSlideInPane
					preview={preview}
					session={session}
					sessionId={session.id}
					cwd={session.cwd}
					sendInput={sendInput}
					onDecision={onDecision}
				/>
			</PhoneReviewSheet>
		</>
	);
}
