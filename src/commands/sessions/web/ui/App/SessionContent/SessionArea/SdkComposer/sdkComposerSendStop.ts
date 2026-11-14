import { bracketedPaste } from "../../../../../../shared/pasteAndSubmit/bracketedPaste";
import type { sdkComposerState } from "./sdkComposerState";
import type { useComposerShell } from "./useComposerShell";

type Draft = { text: string; setText: (text: string) => void };

type Targets = {
	sessionId: string;
	sendInput: (sessionId: string, data: string) => void;
	interruptSession: (sessionId: string) => void;
};

export function sdkComposerSendStop(
	{ text, setText }: Draft,
	state: ReturnType<typeof sdkComposerState>,
	shell: ReturnType<typeof useComposerShell>,
	{ sessionId, sendInput, interruptSession }: Targets,
) {
	return {
		send: () => {
			if (!text.trim() || !state.enabled) return;
			if (shell.shell) shell.run(text.trim());
			else sendInput(sessionId, bracketedPaste(text));
			setText("");
		},
		stop: () => {
			if (state.running && !state.stopping) interruptSession(sessionId);
		},
	};
}
