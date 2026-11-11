import Box from "@mui/material/Box";
import { type ReactNode, useRef } from "react";
import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "../../../../PrDecisionDetails";
import { PreviewWidthContext } from "../../usePreviewWidthContext";
import { PrPreviewSlideIn } from "./PrPreviewSplit/PrPreviewSlideIn";
import { PrPreviewTerminalColumn } from "./PrPreviewSplit/PrPreviewTerminalColumn";
import type { SessionInfo } from "../../../../types";
import { usePreviewWidth } from "./PrPreviewSplit/usePreviewWidth";
import { useRetainedPreview } from "./PrPreviewSplit/useRetainedPreview";
import { splitContainerSx } from "./PrPreviewSplit/splitContainerSx";
import { useStackedSplit } from "./PrPreviewSplit/useStackedSplit";

type OnDecision = (
	requestId: string,
	decision: "approve" | "reject",
	details: PrDecisionDetails,
) => void;

export function PrPreviewSplit({
	preview,
	stackedShow,
	session,
	sessionId,
	cwd,
	sendInput,
	onDecision,
	children,
}: {
	preview: PrPreview | null;
	stackedShow?: PrPreview | undefined;
	session?: SessionInfo | undefined;
	sessionId?: string;
	cwd?: string;
	sendInput?: ((sessionId: string, data: string) => void) | undefined;
	onDecision: OnDecision;
	children: ReactNode;
}) {
	const { rendered, onExited } = useRetainedPreview(preview);
	const containerRef = useRef<HTMLDivElement>(null);
	const stacked = useStackedSplit(containerRef);
	const width = usePreviewWidth(rendered, stacked);
	const open = preview !== null;

	return (
		<Box ref={containerRef} sx={splitContainerSx(stacked)}>
			<PrPreviewTerminalColumn open={open} full={width.full} stacked={stacked}>
				{children}
			</PrPreviewTerminalColumn>
			<PreviewWidthContext.Provider value={width}>
				<PrPreviewSlideIn
					rendered={rendered}
					stackedShow={open ? stackedShow : undefined}
					session={session}
					sessionId={sessionId}
					cwd={cwd}
					sendInput={sendInput}
					open={open}
					onExited={onExited}
					onDecision={onDecision}
				/>
			</PreviewWidthContext.Provider>
		</Box>
	);
}
