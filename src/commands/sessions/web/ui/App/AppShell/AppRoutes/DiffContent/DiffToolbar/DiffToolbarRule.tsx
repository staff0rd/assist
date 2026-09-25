import Box from "@mui/material/Box";

const ruleSx = {
	flex: "0 0 auto",
	width: "1px",
	alignSelf: "stretch",
	my: 1,
	mx: 0.25,
	bgcolor: "divider",
} as const;

export function DiffToolbarRule() {
	return <Box sx={ruleSx} />;
}
