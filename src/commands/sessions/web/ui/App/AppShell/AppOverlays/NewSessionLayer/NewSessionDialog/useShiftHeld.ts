import { useModifiersHeld } from "../../../../../useModifiersHeld";

const isShift = (e: { shiftKey: boolean }) => e.shiftKey;

export function useShiftHeld(): boolean {
	return useModifiersHeld(isShift);
}
