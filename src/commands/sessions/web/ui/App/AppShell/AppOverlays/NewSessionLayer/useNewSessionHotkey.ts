import { shortcutRegistry } from "../../../shortcutRegistry";
import { useCaptureHotkey } from "../../useCaptureHotkey";

export function useNewSessionHotkey(open: () => void): void {
	useCaptureHotkey(shortcutRegistry.newSession.matches, open);
}
