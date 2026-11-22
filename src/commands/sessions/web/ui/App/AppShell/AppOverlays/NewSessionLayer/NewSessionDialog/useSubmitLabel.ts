import {
	autoStartLabel,
	type NewSessionMode,
	newSessionModes,
} from "../newSessionModes";
import { useShiftHeld } from "./useShiftHeld";

export function useSubmitLabel(
	targetKind: string,
	mode: NewSessionMode,
): string {
	const { shift, ctrl } = useShiftHeld();
	if (targetKind === "clone") return "Clone";
	const autoStart = shift ? autoStartLabel(mode) : undefined;
	const label = autoStart ?? newSessionModes[mode].submitLabel;
	return shift && ctrl ? `${label} + yolo` : label;
}
