import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import type { PrPreview, PrPreviewComment } from "../../shared/SessionInfoBase";
import { PrPreviewSlideIn, SPLIT_EASE, SPLIT_MS } from "./PrPreviewSlideIn";
import { useRetainedPreview } from "./useRetainedPreview";

type OnDecision = (
	requestId: string,
	decision: "approve" | "reject",
	comments: PrPreviewComment[],
	screenshots: string[],
) => void;

export function PrPreviewSplit({
	preview,
	cwd,
	onDecision,
	children,
}: {
	preview: PrPreview | null;
	cwd?: string;
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
				cwd={cwd}
				open={open}
				onExited={onExited}
				onDecision={onDecision}
			/>
		</Box>
	);
}
