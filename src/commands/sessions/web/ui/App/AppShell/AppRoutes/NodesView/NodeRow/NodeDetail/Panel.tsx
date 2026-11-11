import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export function Panel({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<Box
			component="section"
			aria-label={title}
			sx={{ display: "grid", gap: 1, alignContent: "start", minWidth: 0 }}
		>
			<Typography
				variant="overline"
				color="text.secondary"
				sx={{ lineHeight: 1.5, fontWeight: 600 }}
			>
				{title}
			</Typography>
			{children}
		</Box>
	);
}
