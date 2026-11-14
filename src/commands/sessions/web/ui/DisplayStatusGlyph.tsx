import { WrenchHeadIcon } from "./designSystem/WrenchHeadIcon";
import type { DisplayStatus } from "./displayStatus";
import { statusGlyph } from "./statusGlyph";

export function DisplayStatusGlyph({ status }: { status: DisplayStatus }) {
	return status === "check" ? <WrenchHeadIcon /> : statusGlyph[status];
}
