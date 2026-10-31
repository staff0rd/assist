import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";

const barSx = {
	flex: "none",
	pt: safeAreaInsets.top,
	bgcolor: "background.default",
} as const;

const rowSx = {
	height: (t: Theme) => t.tokens.density.bar,
	display: "grid",
	gridTemplateColumns:
		"minmax(max-content, 1fr) minmax(0, auto) minmax(max-content, 1fr)",
	columnGap: 1,
	alignItems: "center",
	px: 1.5,
} as const;

const leadingRowSx = {
	height: (t: Theme) => t.tokens.density.bar,
	display: "flex",
	alignItems: "center",
	gap: 0.5,
	px: 0.5,
} as const;

const titleSx = {
	textAlign: "center",
	minWidth: 0,
	maxWidth: 220,
	fontSize: 15,
	fontWeight: 600,
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
} as const;

const leadingTitleSx = {
	flex: 1,
	minWidth: 0,
	fontSize: 15,
	fontWeight: 600,
	lineHeight: 1.25,
	display: "-webkit-box",
	WebkitLineClamp: 2,
	WebkitBoxOrient: "vertical",
	overflow: "hidden",
	overflowWrap: "anywhere",
} as const;

type Props = {
	left?: ReactNode;
	title: string;
	right?: ReactNode;
	leadingTitle?: boolean;
};

export function PhoneNavBar({ left, title, right, leadingTitle }: Props) {
	return (
		<Box component="header" sx={barSx}>
			{leadingTitle ? (
				<Box sx={leadingRowSx}>
					<Box sx={{ flex: "none" }}>{left}</Box>
					<Box component="h1" sx={[leadingTitleSx, { m: 0 }]}>
						{title}
					</Box>
					<Box sx={{ flex: "none", display: "flex" }}>{right}</Box>
				</Box>
			) : (
				<Box sx={rowSx}>
					<Box sx={{ justifySelf: "start", minWidth: 0 }}>{left}</Box>
					<Box sx={titleSx}>{title}</Box>
					<Box sx={{ justifySelf: "end", display: "flex", gap: 0.25 }}>
						{right}
					</Box>
				</Box>
			)}
		</Box>
	);
}
