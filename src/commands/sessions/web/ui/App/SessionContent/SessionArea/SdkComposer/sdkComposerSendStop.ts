import { bracketedPaste } from "../../../../../../shared/pasteAndSubmit/bracketedPaste";
import type { sdkComposerState } from "./sdkComposerState";
import type { useComposerShell } from "./useComposerShell";

type Draft = {
	text: string;
	setText: (text: string) => void;
	suggestion: string | undefined;
};

type Targets = {
	sessionId: string;
	sendInput: (sessionId: string, data: string) => void;
	interruptSession: (sessionId: string) => void;
};

export function sdkComposerSendStop(
	{ text, setText, suggestion }: Draft,
	state: ReturnType<typeof sdkComposerState>,
	shell: ReturnType<typeof useComposerShell>,
	{ sessionId, sendInput, interruptSession }: Targets,
) {
	return {
		send: () => {
			const message = text.trim() ? text : suggestion;
			if (!message?.trim() || !state.enabled) return;
			if (shell.shell) shell.run(message.trim());
			else sendInput(sessionId, bracketedPaste(message));
			setText("");
		},
		stop: () => {
			if (state.running && !state.stopping) interruptSession(sessionId);
		},
	};
}
