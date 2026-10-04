import { shortcutRegistry } from "../../../shortcutRegistry";
import { useCaptureHotkey } from "../../../useCaptureHotkey";

export function useShortcutsSheetHotkey(open: () => void): void {
	useCaptureHotkey(shortcutRegistry.shortcutsSheet.matches, open);
}
