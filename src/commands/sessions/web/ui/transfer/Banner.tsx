import Box from "@mui/material/Box";
import { alpha, type Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type Tone = "warning" | "error";

const bannerSx = (tone: Tone) => (t: Theme) => ({
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	gap: 1,
	px: 1.5,
	py: 0.75,
	flexShrink: 0,
	bgcolor: alpha(t.palette[tone].main, 0.1),
	borderBottom: `1px solid ${alpha(t.palette[tone].main, 0.35)}`,
});

export function Banner({
	tone,
	icon,
	message,
	children,
}: {
	tone: Tone;
	icon: ReactNode;
	message: ReactNode;
	children: ReactNode;
}) {
	return (
		<Box
			role="status"
			data-testid={`transfer-banner-${tone}`}
			sx={bannerSx(tone)}
		>
			<Box sx={{ display: "flex", color: `${tone}.main` }}>{icon}</Box>
			<Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
				{message}
			</Typography>
			{children}
		</Box>
	);
}
