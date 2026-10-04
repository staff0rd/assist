import { useCaptureHotkey } from "../../../../../useCaptureHotkey";
import { useShortcut } from "../../../../../useShortcut";

export function useSaveHotkey(save: () => void): void {
	useCaptureHotkey(useShortcut("save").matches, save);
}
