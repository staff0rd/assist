import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useLayoutEffect, useRef } from "react";

const logSx = {
	m: 0,
	p: 1.5,
	borderRadius: 1,
	bgcolor: (t: Theme) => (t.palette.mode === "dark" ? "#1b1b1c" : "#f3f4f6"),
	fontFamily: "'Roboto Mono', ui-monospace, Menlo, monospace",
	fontSize: 12,
	lineHeight: 1.7,
	maxHeight: 320,
	overflow: "auto",
	whiteSpace: "pre",
} as const;

export function History({ lines }: { lines: string[] }) {
	const ref = useRef<HTMLPreElement>(null);
	useLayoutEffect(() => {
		if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
	}, [lines]);
	if (lines.length === 0)
		return (
			<Typography variant="body2" color="text.secondary">
				No history yet.
			</Typography>
		);
	return (
		<Box component="pre" ref={ref} sx={logSx}>
			{lines.join("\n")}
		</Box>
	);
}
