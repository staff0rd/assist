import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { SPLIT_EASE, SPLIT_MS } from "./slideInSx";

function terminalSize(open: boolean, full: boolean) {
	if (!open) return "100%";
	return full ? "0%" : "50%";
}

export function PrPreviewTerminalColumn({
	open,
	full,
	stacked,
	flipping,
	children,
}: {
	open: boolean;
	full: boolean;
	stacked: boolean;
	flipping: boolean;
	children: ReactNode;
}) {
	const size = terminalSize(open, full);
	const axis = stacked ? "height" : "width";
	return (
		<Box
			sx={{
				display: "flex",
				minHeight: 0,
				flexShrink: 0,
				...(stacked ? { width: "100%", height: size } : { width: size }),
				overflow: "hidden",
				transition: flipping ? "none" : `${axis} ${SPLIT_MS}ms ${SPLIT_EASE}`,
			}}
		>
			{children}
		</Box>
	);
}
