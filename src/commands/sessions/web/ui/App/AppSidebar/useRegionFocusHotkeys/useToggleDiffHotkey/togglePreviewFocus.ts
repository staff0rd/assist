import { focusRegion } from "../../../focusRegion";
import { sessionRegion } from "../sessionRegion";
import { isRegionFocused } from "./isRegionFocused";

export function togglePreviewFocus(
	id: string,
	showSessions: () => void,
	ringColor: string,
): void {
	if (isRegionFocused("preview", id)) {
		focusRegion(sessionRegion("terminal", id), ringColor);
		return;
	}
	showSessions();
	focusRegion(sessionRegion("preview", id), ringColor);
}
