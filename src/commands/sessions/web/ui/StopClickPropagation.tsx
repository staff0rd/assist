import Box from "@mui/material/Box";
import type { ReactNode } from "react";

export function StopClickPropagation({ children }: { children: ReactNode }) {
	return (
		<Box sx={{ display: "contents" }} onClick={(e) => e.stopPropagation()}>
			{children}
		</Box>
	);
}
