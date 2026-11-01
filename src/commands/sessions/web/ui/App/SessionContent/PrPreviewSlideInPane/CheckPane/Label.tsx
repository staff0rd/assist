import { Typography } from "@mui/material";

export function Label({ children }: { children: string }) {
	return (
		<Typography
			variant="overline"
			sx={{ color: "text.secondary", letterSpacing: 1 }}
		>
			{children}
		</Typography>
	);
}
