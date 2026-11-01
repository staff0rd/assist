import { Typography } from "@mui/material";

export function Label({ children }: { children: string }) {
	return (
		<Typography
			variant="caption"
			sx={{ fontWeight: 600, color: "text.secondary" }}
		>
			{children}
		</Typography>
	);
}
