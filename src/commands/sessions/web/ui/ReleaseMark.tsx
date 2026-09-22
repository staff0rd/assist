import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import type { ReactNode } from "react";

const markSx = {
	cursor: "help",
	borderRadius: "2px",
	"&:focus-visible": { outline: "2px solid", outlineOffset: "2px" },
} as const;

export function ReleaseMark({
	title,
	color,
	children,
}: {
	title: string;
	color?: string;
	children: ReactNode;
}) {
	return (
		<Tooltip title={title}>
			<Box component="span" tabIndex={0} sx={markSx} color={color}>
				{children}
			</Box>
		</Tooltip>
	);
}
