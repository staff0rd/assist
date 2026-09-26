import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

const HOTKEYS = ["Ctrl+N", "Alt+N"];

const chipSx = {
	px: 0.5,
	border: 1,
	borderColor: "grey.500",
	borderRadius: 0.5,
	fontFamily: "monospace",
	fontSize: 11,
} as const;

export function NewSessionTooltipTitle() {
	return (
		<Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
			<span>New session</span>
			{HOTKEYS.map((key) => (
				<Box key={key} component="kbd" sx={chipSx}>
					{key}
				</Box>
			))}
		</Stack>
	);
}
