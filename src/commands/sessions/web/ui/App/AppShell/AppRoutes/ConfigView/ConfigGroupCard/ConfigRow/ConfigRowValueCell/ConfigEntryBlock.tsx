import Paper from "@mui/material/Paper";
import type { ReactNode } from "react";

export function ConfigEntryBlock({ children }: { children: ReactNode }) {
	return (
		<Paper
			variant="outlined"
			sx={{ flex: 1, minWidth: 0, p: 1, bgcolor: "transparent" }}
		>
			{children}
		</Paper>
	);
}
