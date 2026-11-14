import Box from "@mui/material/Box";
import { shellSx } from "../TranscriptArea/shellSx";

export function ShellModeChip({ label }: { label: string }) {
	return (
		<Box component="span" aria-hidden sx={shellSx.chip}>
			{label}
		</Box>
	);
}
