import { eyePath } from "./designSystem/eyePath";
import { GlyphIcon } from "./designSystem/GlyphIcon";
import { wrenchHeadPath } from "./designSystem/wrenchHeadPath";
import type { DisplayStatus } from "./displayStatus";
import { statusGlyph } from "./statusGlyph";

export function DisplayStatusGlyph({ status }: { status: DisplayStatus }) {
	if (status === "check")
		return <GlyphIcon path={wrenchHeadPath} testId="wrench-head" />;
	if (status === "design") return <GlyphIcon path={eyePath} testId="eye" />;
	return statusGlyph[status];
}
