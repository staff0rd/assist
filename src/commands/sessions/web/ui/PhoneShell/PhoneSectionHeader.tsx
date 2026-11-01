import Box from "@mui/material/Box";
import { statusGlyph } from "../statusGlyph";

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
	checks = 0,
}: {
	label: string;
	count: number;
	tone?: PhoneSectionTone;
	checks?: number;
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
				{checks > 0 && (
					<Box
						component="span"
						sx={{ color: "check.main", mr: 1 }}
						data-testid="section-check-count"
					>
						{statusGlyph.check} {checks}
					</Box>
				)}
				{count - checks}
			</Box>
		</Box>
	);
}
