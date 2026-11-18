import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import type { ReactNode } from "react";
import { paletteColor } from "../../designSystem/paletteColor";

const gridSx = {
	display: "grid",
	gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
	gap: 2,
} as const;

export function BoardGroup({
	title,
	color,
	count,
	children,
}: {
	title: string;
	color: string;
	count: number;
	children: ReactNode;
}) {
	return (
		<Box
			component="section"
			aria-label={title}
			sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}
		>
			<Box
				component="h2"
				sx={{
					m: 0,
					display: "flex",
					alignItems: "center",
					gap: 1.25,
					typography: "caption",
					fontWeight: 600,
					letterSpacing: "0.06em",
					textTransform: "uppercase",
					color,
				}}
			>
				{title}
				<Box
					component="span"
					sx={(t) => ({
						px: 1,
						borderRadius: 999,
						letterSpacing: 0,
						bgcolor: alpha(paletteColor(t, color), 0.16),
					})}
				>
					{count}
				</Box>
			</Box>
			<Box sx={gridSx}>{children}</Box>
		</Box>
	);
}
