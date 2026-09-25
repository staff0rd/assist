import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const wrapperSx = {
	display: "flex",
	gap: 0.5,
	ml: "auto",
	pl: 0.5,
	flexShrink: 0,
} as const;

const countSx = { fontFamily: "monospace", fontSize: 11 } as const;

export function DiffFileTreeLineCounts({
	added,
	removed,
}: {
	added: number;
	removed: number;
}) {
	return (
		<Box sx={wrapperSx}>
			<Typography component="span" sx={countSx} color="success.main">
				+{added}
			</Typography>
			<Typography component="span" sx={countSx} color="error.main">
				-{removed}
			</Typography>
		</Box>
	);
}
