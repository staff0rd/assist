import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import type { PrPreview } from "../../../../../../../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "../../../../../../PrDecisionDetails";
import { PrPreviewSlideIn } from "./PrPreviewSplit/PrPreviewSlideIn";
import { SPLIT_EASE, SPLIT_MS } from "./PrPreviewSplit/slideInSx";
import { useRetainedPreview } from "./PrPreviewSplit/useRetainedPreview";

type OnDecision = (
	requestId: string,
	decision: "approve" | "reject",
	details: PrDecisionDetails,
) => void;

export function PrPreviewSplit({
	preview,
	sessionId,
	cwd,
	sendInput,
	onDecision,
	children,
}: {
	preview: PrPreview | null;
	sessionId?: string;
	cwd?: string;
	sendInput?: ((sessionId: string, data: string) => void) | undefined;
	onDecision: OnDecision;
	children: ReactNode;
}) {
	const { rendered, onExited } = useRetainedPreview(preview);
	const open = preview !== null;

	return (
		<Box
			sx={{
				display: "flex",
				flex: 1,
				minHeight: 0,
				position: "relative",
				overflow: "hidden",
			}}
		>
			<Box
				sx={{
					display: "flex",
					width: open ? "50%" : "100%",
					transition: `width ${SPLIT_MS}ms ${SPLIT_EASE}`,
				}}
			>
				{children}
			</Box>
			<PrPreviewSlideIn
				rendered={rendered}
				sessionId={sessionId}
				cwd={cwd}
				sendInput={sendInput}
				open={open}
				onExited={onExited}
				onDecision={onDecision}
			/>
		</Box>
	);
}
