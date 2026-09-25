import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type Props = {
	label: string;
	children: ReactNode;
};

export function ConfigFieldRow({ label, children }: Props) {
	return (
		<Box sx={{ display: "flex", gap: 1, alignItems: "baseline" }}>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ fontFamily: "monospace", flexShrink: 0, minWidth: "7rem" }}
			>
				{label}
			</Typography>
			<Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
		</Box>
	);
}
