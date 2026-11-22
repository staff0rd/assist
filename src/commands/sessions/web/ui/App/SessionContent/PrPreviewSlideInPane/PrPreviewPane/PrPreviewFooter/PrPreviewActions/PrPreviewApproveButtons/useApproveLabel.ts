import { useModifiersHeld } from "../../../../../../../useModifiersHeld";
import { approveLabel } from "./approveLabel";

const isShift = (e: { shiftKey: boolean }) => e.shiftKey;
const isCtrl = (e: { ctrlKey: boolean }) => e.ctrlKey;

export function useApproveLabel(): string {
	return approveLabel(useModifiersHeld(isShift), useModifiersHeld(isCtrl));
}
