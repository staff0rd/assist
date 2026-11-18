import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import type { Theme } from "@mui/material/styles";
import type { MouseEvent } from "react";
import { formatTextSizeOffset } from "../../../../formatTextSizeOffset";
import {
	MAX_TEXT_SIZE_OFFSET,
	MIN_TEXT_SIZE_OFFSET,
} from "../../../../textSizeOffset";

const stepSx = {
	fontSize: (t: Theme) => t.tokens.density.iconButton.icon,
	lineHeight: 1,
} as const;

export function TextSizeStepper({
	offset,
	onStep,
}: {
	offset: number;
	onStep: (delta: number) => void;
}) {
	const step = (delta: number) => (event: MouseEvent) => {
		event.stopPropagation();
		onStep(delta);
	};
	return (
		<Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
			<IconButton
				size="small"
				aria-label="Smaller text"
				tabIndex={-1}
				disabled={offset <= MIN_TEXT_SIZE_OFFSET}
				onClick={step(-1)}
				sx={stepSx}
			>
				−
			</IconButton>
			<Box
				component="span"
				aria-live="polite"
				sx={{
					minWidth: "4ch",
					textAlign: "center",
					typography: "caption",
					fontFamily: "fontFamilyMono",
					color: offset === 0 ? "text.secondary" : "text.primary",
				}}
			>
				{formatTextSizeOffset(offset)}
			</Box>
			<IconButton
				size="small"
				aria-label="Larger text"
				tabIndex={-1}
				disabled={offset >= MAX_TEXT_SIZE_OFFSET}
				onClick={step(1)}
				sx={stepSx}
			>
				+
			</IconButton>
		</Box>
	);
}
