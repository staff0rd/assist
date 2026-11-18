import Box from "@mui/material/Box";
import { PreviewWidthContext } from "../../usePreviewWidthContext";
import type { PrPreviewSplitProps } from "./PrPreviewSplit/PrPreviewSplitProps";
import { PrPreviewSlideIn } from "./PrPreviewSplit/PrPreviewSlideIn";
import { PrPreviewTerminalColumn } from "./PrPreviewSplit/PrPreviewTerminalColumn";
import { useRetainedPreview } from "./PrPreviewSplit/useRetainedPreview";
import { splitContainerSx } from "./PrPreviewSplit/splitContainerSx";
import { usePreviewLayout } from "./PrPreviewSplit/usePreviewLayout";

export function PrPreviewSplit({
	preview,
	stackedShow,
	session,
	sessionId,
	cwd,
	sendInput,
	onDecision,
	placeholder,
	children,
}: PrPreviewSplitProps) {
	const { rendered, onExited } = useRetainedPreview(preview);
	const { containerRef, width } = usePreviewLayout(rendered);
	const open = preview !== null || placeholder !== undefined;

	return (
		<Box ref={containerRef} sx={splitContainerSx(width.stacked)}>
			<PrPreviewTerminalColumn
				open={open}
				full={width.full}
				stacked={width.stacked}
				flipping={width.flipping}
			>
				{children}
			</PrPreviewTerminalColumn>
			<PreviewWidthContext.Provider value={width}>
				<PrPreviewSlideIn
					rendered={rendered}
					placeholder={placeholder}
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
