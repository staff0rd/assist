import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";

export type NodeDotTone = "ok" | "warn" | "error" | "off";

const toneColor = {
	ok: (t: Theme) => t.palette.success.main,
	warn: (t: Theme) => t.palette.warning.main,
	error: (t: Theme) => t.palette.error.main,
	off: (t: Theme) => t.palette.text.disabled,
} as const;

export function NodeDot({ tone }: { tone: NodeDotTone }) {
	return (
		<Box
			component="span"
			sx={{
				width: 8,
				height: 8,
				flex: "none",
				borderRadius: "50%",
				bgcolor: toneColor[tone],
			}}
		/>
	);
}
