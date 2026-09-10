import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const labelSx = { display: "block" } as const;

const valueSx = {
	fontWeight: 400,
	fontVariantNumeric: "tabular-nums",
} as const;

export function UsageStat({
	label,
	value,
	foot,
}: {
	label: string;
	value: string;
	foot?: string;
}) {
	return (
		<Box>
			<Typography variant="caption" color="text.secondary" sx={labelSx}>
				{label}
			</Typography>
			<Typography variant="h5" sx={valueSx}>
				{value}
			</Typography>
			{foot ? (
				<Typography variant="caption" color="text.disabled" sx={labelSx}>
					{foot}
				</Typography>
			) : null}
		</Box>
	);
}
