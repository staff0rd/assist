import {
	SUBMIT,
	unwrapBracketedPaste,
} from "../shared/pasteAndSubmit/bracketedPaste";
import { daemonLog } from "./daemonLog";
import { skipsTerminalPath } from "./skipsTerminalPath";
import type { Session } from "./types";

/* why: every prompt sender (composer, phone reply, diff/file comments, daemon
 * typed prompts) pastes then submits, so a paste becomes one SDK user message
 * and its trailing submit has nothing left to do. */
export function writeToSdkSession(session: Session, data: string): void {
	const text = unwrapBracketedPaste(data);
	if (text !== undefined) {
		daemonLog(`session ${session.id} sdk message received from input`);
		session.sdkPromptSuggestion = undefined;
		session.pty?.sdk?.send(text);
		return;
	}
	if (data === SUBMIT) {
		daemonLog(`session ${session.id} sdk submit ignored: paste already sent`);
		return;
	}
	skipsTerminalPath(session, "input");
}
