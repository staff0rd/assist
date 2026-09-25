import Box from "@mui/material/Box";

const labelSx = {
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function DiffScopeLabel({
	label,
	note,
}: {
	label: string;
	note?: string;
}) {
	return (
		<>
			<Box component="span" sx={labelSx}>
				{label}
			</Box>
			{note && (
				<Box
					component="span"
					sx={{ ...labelSx, ml: 0.75, color: "text.disabled" }}
				>
					{note}
				</Box>
			)}
		</>
	);
}
