import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";

const barSx = {
	flex: "none",
	pt: safeAreaInsets.top,
	bgcolor: "background.default",
} as const;

const rowSx = {
	height: 44,
	display: "grid",
	gridTemplateColumns:
		"minmax(max-content, 1fr) minmax(0, auto) minmax(max-content, 1fr)",
	columnGap: 1,
	alignItems: "center",
	px: 1,
} as const;

const titleSx = {
	textAlign: "center",
	minWidth: 0,
	maxWidth: 220,
} as const;

const titleTextSx = {
	fontSize: 15,
	fontWeight: 600,
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
} as const;

const subtitleSx = {
	fontSize: 12,
	color: "text.secondary",
	fontFamily: "fontFamilyMono",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
} as const;

type Props = {
	left?: ReactNode;
	title: string;
	subtitle?: string;
	right?: ReactNode;
};

export function PhoneNavBar({ left, title, subtitle, right }: Props) {
	return (
		<Box component="header" sx={barSx}>
			<Box sx={rowSx}>
				<Box sx={{ justifySelf: "start", minWidth: 0 }}>{left}</Box>
				<Box sx={titleSx}>
					<Box sx={titleTextSx}>{title}</Box>
					{subtitle && <Box sx={subtitleSx}>{subtitle}</Box>}
				</Box>
				<Box sx={{ justifySelf: "end", display: "flex", gap: 0.25 }}>
					{right}
				</Box>
			</Box>
		</Box>
	);
}
