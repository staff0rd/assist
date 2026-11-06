import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

const headerSx = {
	display: "flex",
	alignItems: "baseline",
	flexWrap: "wrap",
	columnGap: 1,
	px: 3,
	pt: 1.5,
	pb: 0.5,
} as const;

export function TesterSection({
	name,
	hint,
	empty,
	children,
}: {
	name: string;
	hint: string;
	empty: boolean;
	children: ReactNode;
}) {
	return (
		<Box component="section" aria-label={name}>
			<Box sx={headerSx}>
				<Typography variant="overline" color="text.secondary">
					{name}
				</Typography>
				<Typography variant="caption" color="text.secondary">
					{hint}
				</Typography>
			</Box>
			{empty ? (
				<Typography variant="body2" color="text.secondary" sx={{ px: 3 }}>
					No testers
				</Typography>
			) : (
				children
			)}
		</Box>
	);
}
