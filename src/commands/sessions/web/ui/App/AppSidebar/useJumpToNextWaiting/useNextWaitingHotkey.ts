import { useCaptureHotkey } from "../../useCaptureHotkey";
import { useShortcut } from "../../useShortcut";

export function useNextWaitingHotkey(onJump: () => void): void {
	useCaptureHotkey(useShortcut("nextWaiting").matches, onJump);
}
