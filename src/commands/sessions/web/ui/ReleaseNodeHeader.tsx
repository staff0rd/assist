import Box from "@mui/material/Box";
import { ReleaseMark } from "./ReleaseMark";
import type { ReleaseMarkState } from "./releaseNodeState";
import { releaseToneColors } from "./releaseToneColors";

const topSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	fontFamily: "monospace",
	fontWeight: 600,
	fontSize: 13,
} as const;

const labelSx = { overflowWrap: "anywhere" } as const;

const glyphSx = { ml: "auto", fontSize: 11, lineHeight: 1 } as const;

export function ReleaseNodeHeader({
	label,
	mark,
}: {
	label: string;
	mark: ReleaseMarkState;
}) {
	return (
		<Box sx={topSx}>
			<Box component="span" sx={labelSx}>
				{label}
			</Box>
			<Box component="span" sx={glyphSx}>
				<ReleaseMark title={mark.tooltip} color={releaseToneColors[mark.tone]}>
					{mark.glyph}
				</ReleaseMark>
			</Box>
		</Box>
	);
}
