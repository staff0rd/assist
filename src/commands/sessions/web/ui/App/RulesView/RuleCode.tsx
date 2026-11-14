import Typography from "@mui/material/Typography";

export function RuleCode({ code }: { code: string | undefined }) {
	return (
		<Typography
			variant="caption"
			sx={{
				fontFamily: "fontFamilyMono",
				color: code ? "primary.main" : "text.disabled",
				pt: 0.25,
			}}
		>
			{code ?? "—"}
		</Typography>
	);
}
