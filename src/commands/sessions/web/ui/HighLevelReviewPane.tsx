import { Box, Divider, Stack } from "@mui/material";
import { useMemo } from "react";
import type { PrPreview } from "../../shared/SessionInfoBase";
import { HighLevelCheckGroup } from "./HighLevelCheckGroup";
import { HighLevelReviewActions } from "./HighLevelReviewActions";
import { highLevelDecisionDetails } from "./highLevelDecisionDetails";
import { parseHighLevelPreview } from "./parseHighLevelPreview";
import type { PrDecisionDetails } from "./PrDecisionDetails";
import { PreviewMetadataList } from "./PreviewMetadataList";
import { PrPreviewHeader } from "./PrPreviewHeader";
import { prPreviewPaneSx } from "./prPreviewPaneSx";
import { useHighLevelChecklist } from "./useHighLevelChecklist";

export function HighLevelReviewPane({
	preview,
	onDecision,
}: {
	preview: PrPreview;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
}) {
	const checks = useMemo(
		() => parseHighLevelPreview(preview.body),
		[preview.body],
	);
	const checklist = useHighLevelChecklist(checks);

	const decide = (decision: "approve" | "reject") =>
		onDecision(decision, highLevelDecisionDetails(checklist.checklist()));

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<PreviewMetadataList items={preview.metadata ?? []} />
			<Divider />
			<Stack
				spacing={2}
				sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 2 }}
			>
				<HighLevelCheckGroup
					heading="Evaluated for you"
					checks={checks.filter((check) => check.kind === "deterministic")}
					checklist={checklist}
				/>
				<HighLevelCheckGroup
					heading="Yours to judge"
					checks={checks.filter((check) => check.kind === "manual")}
					checklist={checklist}
				/>
			</Stack>
			<Divider />
			<HighLevelReviewActions
				failed={checks.filter((check) => check.status === "fail").length}
				outstanding={checklist.outstanding}
				onApprove={() => decide("approve")}
				onRequestChanges={() => decide("reject")}
			/>
		</Box>
	);
}
