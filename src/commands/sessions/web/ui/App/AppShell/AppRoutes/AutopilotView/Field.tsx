import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function Field({ label, value }: { label: string; value: string }) {
	return (
		<Box>
			<Typography component="dt" variant="caption" color="text.secondary">
				{label}
			</Typography>
			<Typography component="dd" variant="body2" sx={{ m: 0 }}>
				{value}
			</Typography>
		</Box>
	);
}
