import { useModifiersHeld } from "../../../../../useModifiersHeld";

const isShift = (e: { shiftKey: boolean }) => e.shiftKey;
const isCtrl = (e: { ctrlKey: boolean }) => e.ctrlKey;

export function useShiftHeld(): { shift: boolean; ctrl: boolean } {
	return { shift: useModifiersHeld(isShift), ctrl: useModifiersHeld(isCtrl) };
}
