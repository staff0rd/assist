import { shortcutRegistry } from "../../../shortcutRegistry";
import { useCaptureHotkey } from "../../useCaptureHotkey";

export function useQuickOpenHotkey(open: () => void): void {
	useCaptureHotkey(shortcutRegistry.quickOpen.matches, open);
}
