import Box from "@mui/material/Box";
import { ReleaseMark } from "../../../../ReleaseMark";
import type { ReleaseMarkState } from "./releaseNodeState";
import { releaseToneColors } from "../../../../releaseToneColors";
import { sessionTextSize } from "../../../../../sessionTextSize";

const topSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	fontFamily: "fontFamilyMono",
	fontWeight: 600,
	fontSize: sessionTextSize(15.6),
} as const;

const labelSx = { overflowWrap: "anywhere" } as const;

const glyphSx = {
	ml: "auto",
	fontSize: sessionTextSize(13.2),
	lineHeight: 1,
} as const;

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
