import { isQuickOpenKey } from "../../../isQuickOpenKey";
import { useCaptureHotkey } from "../useCaptureHotkey";

export function useQuickOpenHotkey(open: () => void): void {
	useCaptureHotkey(isQuickOpenKey, open);
}
