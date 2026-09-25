import { isNewSessionKey } from "../../isNewSessionKey";
import { useCaptureHotkey } from "../useCaptureHotkey";

export function useNewSessionHotkey(open: () => void): void {
	useCaptureHotkey(isNewSessionKey, open);
}
