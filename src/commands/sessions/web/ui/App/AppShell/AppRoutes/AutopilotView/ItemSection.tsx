import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

const headingSx = {
	display: "flex",
	gap: 1,
	alignItems: "center",
	fontWeight: 600,
	letterSpacing: ".06em",
	textTransform: "uppercase",
	color: "text.secondary",
	mb: 1,
} as const;

const countSx = { fontFamily: "fontFamilyMono", color: "text.disabled" };

export function ItemSection({
	title,
	count,
	empty,
	children,
}: {
	title: string;
	count: number;
	empty: string;
	children: ReactNode;
}) {
	return (
		<Box component="section" sx={{ mb: 3 }}>
			<Typography variant="caption" component="h2" sx={headingSx}>
				{title}
				<Box component="span" sx={countSx}>
					{count}
				</Box>
			</Typography>
			<Paper variant="outlined" sx={{ overflow: "hidden" }}>
				{count > 0 ? (
					children
				) : (
					<Typography color="text.secondary" sx={{ p: 2 }}>
						{empty}
					</Typography>
				)}
			</Paper>
		</Box>
	);
}
