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
	const shiftHeld = useShiftHeld();
	if (targetKind === "clone") return "Clone";
	const autoStart = shiftHeld ? autoStartLabel(mode) : undefined;
	return autoStart ?? newSessionModes[mode].submitLabel;
}
