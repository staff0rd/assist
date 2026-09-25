import Box from "@mui/material/Box";
import type { ReactNode } from "react";

export function StopCardActivation({ children }: { children: ReactNode }) {
	const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();
	return (
		<Box
			sx={{ display: "contents" }}
			onClick={stop}
			onMouseDown={stop}
			onTouchStart={stop}
		>
			{children}
		</Box>
	);
}
