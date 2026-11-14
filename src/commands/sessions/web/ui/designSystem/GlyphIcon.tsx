import SvgIcon from "@mui/material/SvgIcon";

const glyphIconSx = {
	fontSize: "inherit",
	verticalAlign: "-0.125em",
} as const;

export function GlyphIcon({
	path,
	testId,
}: {
	path: { d: string; transform?: string; fillRule?: "evenodd" };
	testId: string;
}) {
	return (
		<SvgIcon viewBox="0 0 16 16" sx={glyphIconSx} data-testid={testId}>
			<path {...path} />
		</SvgIcon>
	);
}
