import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function Stat({
	label,
	value,
	note,
	alert,
}: {
	label: string;
	value: string;
	note: string;
	alert?: boolean;
}) {
	return (
		<Box sx={{ p: 2 }}>
			<Typography variant="caption" component="div" color="text.secondary">
				{label}
			</Typography>
			<Typography
				variant="h6"
				color={alert ? "error" : undefined}
				sx={{ fontVariantNumeric: "tabular-nums" }}
			>
				{value}
			</Typography>
			<Typography variant="caption" component="div" color="text.secondary">
				{note}
			</Typography>
		</Box>
	);
}
