import { Box, Divider } from "@mui/material";
import { useMemo } from "react";
import type { PrPreview } from "../../../../../../../../../../../shared/SessionInfoBase";
import { MiroBoardActions } from "./MiroBoardPane/MiroBoardActions";
import { MiroBoardCanvas } from "./MiroBoardPane/MiroBoardCanvas";
import { miroDecisionDetails } from "./MiroBoardPane/miroDecisionDetails";
import type { PrDecisionDetails } from "../../../../../../../../../PrDecisionDetails";
import { parseMiroBoardPreview } from "./MiroBoardPane/parseMiroBoardPreview";
import { PrPreviewHeader } from "./PrPreviewHeader";
import { prPreviewPaneSx } from "./prPreviewPaneSx";
import { useMiroAnchorSelection } from "./MiroBoardPane/useMiroAnchorSelection";

export function MiroBoardPane({
	preview,
	onDecision,
}: {
	preview: PrPreview;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
}) {
	const boxes = useMemo(
		() => parseMiroBoardPreview(preview.body),
		[preview.body],
	);
	const selection = useMiroAnchorSelection();

	const confirm = () => {
		const { topLeft, bottomRight } = selection;
		if (topLeft === null || bottomRight === null) return;
		onDecision("approve", miroDecisionDetails({ topLeft, bottomRight }));
	};

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<Divider />
			<MiroBoardCanvas boxes={boxes} selection={selection} />
			<Divider />
			<MiroBoardActions
				selection={selection}
				onConfirm={confirm}
				onReject={() => onDecision("reject", miroDecisionDetails())}
			/>
		</Box>
	);
}
