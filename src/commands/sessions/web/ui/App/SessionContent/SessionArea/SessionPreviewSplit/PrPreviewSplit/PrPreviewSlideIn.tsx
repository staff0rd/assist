import Box from "@mui/material/Box";
import { SessionTextSizeTheme } from "../../../../SessionTextSizeTheme";
import { PrPreviewSlideInPane } from "../../../PrPreviewSlideInPane";
import { CoveredPane } from "./PrPreviewSlideIn/CoveredPane";
import { exitOnSlideOut } from "./PrPreviewSlideIn/exitOnSlideOut";
import type { PrPreviewSlideInProps } from "./PrPreviewSlideIn/PrPreviewSlideInProps";
import { StackedShowPane } from "./PrPreviewSlideIn/StackedShowPane";
import { useSlideInSx } from "./PrPreviewSlideIn/useSlideInSx";

export function PrPreviewSlideIn({
	rendered,
	placeholder,
	stackedShow,
	session,
	sessionId,
	cwd,
	sendInput,
	open,
	onExited,
	onDecision,
}: PrPreviewSlideInProps) {
	const sx = useSlideInSx(open);

	return (
		<Box
			aria-hidden={!open}
			data-preview-session-id={open ? sessionId : undefined}
			tabIndex={open ? -1 : undefined}
			onTransitionEnd={exitOnSlideOut(open, onExited)}
			sx={sx}
		>
			<SessionTextSizeTheme>
				{placeholder}
				{!placeholder && rendered && (
					<CoveredPane covered={stackedShow !== undefined}>
						<PrPreviewSlideInPane
							key={rendered.requestId}
							preview={rendered}
							session={session}
							sessionId={sessionId}
							cwd={cwd}
							sendInput={sendInput}
							onDecision={(decision, details) =>
								onDecision(rendered.requestId, decision, details)
							}
						/>
					</CoveredPane>
				)}
				{stackedShow && (
					<StackedShowPane
						show={stackedShow}
						session={session}
						sendInput={sendInput}
						onDecision={onDecision}
					/>
				)}
			</SessionTextSizeTheme>
		</Box>
	);
}
