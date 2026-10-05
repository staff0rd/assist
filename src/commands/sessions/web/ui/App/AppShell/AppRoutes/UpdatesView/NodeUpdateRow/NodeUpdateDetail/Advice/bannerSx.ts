import { alpha, type Theme } from "@mui/material/styles";

export const bannerSx = (tone: "warning" | "error") => (t: Theme) => ({
	p: 1.5,
	borderRadius: 1,
	bgcolor: alpha(t.palette[tone].main, 0.1),
	display: "flex",
	gap: 1.5,
	alignItems: "flex-start",
	flexWrap: "wrap",
});

export const bannerTextSx = { flex: "1 1 260px" } as const;
