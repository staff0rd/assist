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

export type PhoneSectionTone = "warning" | "accent";

const toneColor: Record<PhoneSectionTone, string> = {
	warning: "warning.main",
	accent: "primary.main",
};

export function PhoneSectionHeader({
	label,
	count,
	tone,
}: {
	label: string;
	count: number;
	tone?: PhoneSectionTone;
}) {
	return (
		<Box
			sx={{
				...headerSx,
				color: tone ? toneColor[tone] : "text.secondary",
			}}
		>
			<span>{label}</span>
			<Box component="span" sx={{ fontFamily: "fontFamilyMono" }}>
				{count}
			</Box>
		</Box>
	);
}
