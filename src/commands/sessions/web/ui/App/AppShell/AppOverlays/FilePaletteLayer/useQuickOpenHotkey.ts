import { useCaptureHotkey } from "../../../useCaptureHotkey";
import { useShortcut } from "../../../useShortcut";

export function useQuickOpenHotkey(open: () => void): void {
	useCaptureHotkey(useShortcut("quickOpen").matches, open);
}
