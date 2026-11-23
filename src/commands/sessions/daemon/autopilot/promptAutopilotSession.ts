import type { SessionManager } from "../SessionManager";

export function promptAutopilotSession(
	manager: SessionManager,
	sessionId: string,
	text: string,
): boolean {
	const sdk = manager.session(sessionId)?.pty?.sdk;
	if (sdk) {
		sdk.send(text);
		return true;
	}
	return manager.io.typePrompt(sessionId, text).ok;
}
