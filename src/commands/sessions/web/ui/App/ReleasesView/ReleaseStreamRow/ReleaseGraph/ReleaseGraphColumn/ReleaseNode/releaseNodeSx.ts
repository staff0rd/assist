import type { SxProps, Theme } from "@mui/material/styles";
import type { ReleaseNodeKind } from "../../../../../../../releases/types";
import {
	type ReleaseTone,
	releaseToneColors,
} from "../../../../releaseToneColors";

export function releaseNodeSx(
	kind: ReleaseNodeKind,
	tone: ReleaseTone,
	dimmed: boolean,
	ringed: boolean,
): SxProps<Theme> {
	return {
		position: "relative",
		zIndex: 1,
		borderRadius: 1,
		border: 1,
		px: 1,
		py: 0.5,
		transition: "opacity 0.2s ease",
		bgcolor: kind === "environment" ? "background.paper" : "action.hover",
		borderColor: releaseToneColors[tone],
		borderStyle: tone === "idle" ? "dashed" : "solid",
		opacity: dimmed ? 0.22 : 1,
		outline: ringed ? 2 : 0,
		outlineColor: "primary.main",
		outlineStyle: "solid",
	};
}
