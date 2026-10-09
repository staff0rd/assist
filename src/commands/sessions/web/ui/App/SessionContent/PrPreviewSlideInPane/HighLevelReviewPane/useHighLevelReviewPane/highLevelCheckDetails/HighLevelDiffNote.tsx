import { Typography } from "@mui/material";

export function HighLevelDiffNote({ children }: { children: string }) {
	return (
		<Typography variant="caption" sx={{ color: "text.secondary" }}>
			{children}
		</Typography>
	);
}
