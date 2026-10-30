import Box from "@mui/material/Box";

const grabSx = {
	width: 36,
	height: 5,
	borderRadius: "3px",
	bgcolor: "text.disabled",
	opacity: 0.5,
	mx: "auto",
	mb: 0.75,
} as const;

export function PhoneSheetGrab() {
	return <Box sx={grabSx} />;
}
