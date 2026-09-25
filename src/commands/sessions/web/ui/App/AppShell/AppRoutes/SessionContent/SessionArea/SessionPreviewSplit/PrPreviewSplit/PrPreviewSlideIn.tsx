import Box from "@mui/material/Box";
import type { TransitionEvent } from "react";
import type { PrPreview } from "../../../../../../../../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "../../../../../../../PrDecisionDetails";
import { PrPreviewSlideInPane } from "./PrPreviewSlideIn/PrPreviewSlideInPane";
import { slideInSx } from "./slideInSx";

export function PrPreviewSlideIn({
	rendered,
	sessionId,
	cwd,
	sendInput,
	open,
	onExited,
	onDecision,
}: {
	rendered: PrPreview | null;
	sessionId?: string;
	cwd?: string;
	sendInput?: ((sessionId: string, data: string) => void) | undefined;
	open: boolean;
	onExited: () => void;
	onDecision: (
		requestId: string,
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
}) {
	const handleTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
		if (!open && e.propertyName === "transform" && e.target === e.currentTarget)
			onExited();
	};

	return (
		<Box
			aria-hidden={!open}
			onTransitionEnd={handleTransitionEnd}
			sx={slideInSx(open)}
		>
			{rendered && (
				<PrPreviewSlideInPane
					key={rendered.requestId}
					preview={rendered}
					sessionId={sessionId}
					cwd={cwd}
					sendInput={sendInput}
					onDecision={(decision, details) =>
						onDecision(rendered.requestId, decision, details)
					}
				/>
			)}
		</Box>
	);
}
