import Box from "@mui/material/Box";
import type { TransitionEvent } from "react";
import type { PrPreview, PrPreviewComment } from "../../shared/SessionInfoBase";
import { PrPreviewPane } from "./PrPreviewPane";

export const SPLIT_MS = 280;
export const SPLIT_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

export function PrPreviewSlideIn({
	rendered,
	cwd,
	open,
	onExited,
	onDecision,
}: {
	rendered: PrPreview | null;
	cwd?: string;
	open: boolean;
	onExited: () => void;
	onDecision: (
		requestId: string,
		decision: "approve" | "reject",
		comments: PrPreviewComment[],
		screenshots: string[],
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
			sx={{
				position: "absolute",
				top: 0,
				right: 0,
				bottom: 0,
				width: "50%",
				display: "flex",
				transform: open ? "none" : "translateX(100%)",
				opacity: open ? 1 : 0,
				transition: `transform ${SPLIT_MS}ms ${SPLIT_EASE}, opacity ${SPLIT_MS}ms ${SPLIT_EASE}`,
			}}
		>
			{rendered && (
				<PrPreviewPane
					key={rendered.requestId}
					preview={rendered}
					cwd={cwd}
					onDecision={(decision, comments, screenshots) =>
						onDecision(rendered.requestId, decision, comments, screenshots)
					}
				/>
			)}
		</Box>
	);
}
