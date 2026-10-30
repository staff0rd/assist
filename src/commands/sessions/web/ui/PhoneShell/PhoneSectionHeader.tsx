import Box from "@mui/material/Box";

const headerSx = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "baseline",
	px: 2,
	pt: 1.75,
	pb: 0.75,
	fontSize: 13,
	fontWeight: 600,
	letterSpacing: "0.04em",
	textTransform: "uppercase",
} as const;

export function PhoneSectionHeader({
	label,
	count,
	attention,
}: {
	label: string;
	count: number;
	attention?: boolean;
}) {
	return (
		<Box
			sx={{
				...headerSx,
				color: attention ? "warning.main" : "text.secondary",
			}}
		>
			<span>{label}</span>
			<Box component="span" sx={{ fontFamily: "fontFamilyMono" }}>
				{count}
			</Box>
		</Box>
	);
}
