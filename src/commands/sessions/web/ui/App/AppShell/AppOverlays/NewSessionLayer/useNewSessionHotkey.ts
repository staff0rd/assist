import { useCaptureHotkey } from "../../../useCaptureHotkey";
import { useShortcut } from "../../../useShortcut";

export function useNewSessionHotkey(open: () => void): void {
	useCaptureHotkey(useShortcut("newSession").matches, open);
}
