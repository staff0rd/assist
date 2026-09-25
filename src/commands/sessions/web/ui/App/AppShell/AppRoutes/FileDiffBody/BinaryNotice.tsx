import Typography from "@mui/material/Typography";

export function BinaryNotice() {
	return (
		<Typography
			variant="body2"
			color="text.secondary"
			sx={{ fontFamily: "monospace", py: 1 }}
		>
			Binary file — no preview.
		</Typography>
	);
}
