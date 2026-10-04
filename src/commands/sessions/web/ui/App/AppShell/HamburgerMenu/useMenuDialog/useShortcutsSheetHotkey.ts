import { useCaptureHotkey } from "../../../useCaptureHotkey";
import { useShortcut } from "../../../useShortcut";

export function useShortcutsSheetHotkey(open: () => void): void {
	useCaptureHotkey(useShortcut("shortcutsSheet").matches, open);
}
