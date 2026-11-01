import Box from "@mui/material/Box";

const eyebrowSx = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	fontSize: 12,
	fontWeight: 600,
	letterSpacing: ".04em",
	textTransform: "uppercase",
	color: "check.main",
} as const;

const phaseSx = {
	fontFamily: "fontFamilyMono",
	fontWeight: 400,
	letterSpacing: 0,
	textTransform: "none",
	color: "text.secondary",
} as const;

export function PhoneCheckEyebrow({ phase }: { phase: string | undefined }) {
	return (
		<Box sx={eyebrowSx}>
			<span>Manual check</span>
			{phase && (
				<Box component="span" sx={phaseSx}>
					phase {phase}
				</Box>
			)}
		</Box>
	);
}
