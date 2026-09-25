import { bracketedPaste, SUBMIT } from "./pasteAndSubmit/bracketedPaste";

const SUBMIT_DELAY_MS = 150;

export function pasteAndSubmit(
	sendInput: (sessionId: string, data: string) => void,
	sessionId: string,
	text: string,
): void {
	sendInput(sessionId, bracketedPaste(text));
	setTimeout(() => sendInput(sessionId, SUBMIT), SUBMIT_DELAY_MS);
}
