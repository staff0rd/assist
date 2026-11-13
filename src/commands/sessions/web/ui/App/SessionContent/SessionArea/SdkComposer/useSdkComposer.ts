import { type KeyboardEvent, useState } from "react";
import { bracketedPaste } from "../../../../../../shared/pasteAndSubmit/bracketedPaste";
import { useSlashSuggestions } from "../../../../slashSuggestions/useSlashSuggestions";
import { useSuggestedSlashCommands } from "../../../../slashSuggestions/useSuggestedSlashCommands";
import type { SessionInfo } from "../../../../types";
import { sdkComposerState } from "./sdkComposerState";

export function useSdkComposer(
	session: SessionInfo,
	sendInput: (sessionId: string, data: string) => void,
	interruptSession: (sessionId: string) => void,
) {
	const [text, setText] = useState("");
	const commands = useSuggestedSlashCommands(
		session.harness,
		session.cwd,
		session.node,
	);
	const slash = useSlashSuggestions(commands, text, setText);
	const state = sdkComposerState(session);
	const send = () => {
		if (!text.trim() || !state.enabled) return;
		sendInput(session.id, bracketedPaste(text));
		setText("");
	};
	const stop = () => {
		if (state.running && !state.stopping) interruptSession(session.id);
	};
	const onKeyDown = (e: KeyboardEvent) => {
		if (slash.onKeyDown(e)) return;
		if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
			e.preventDefault();
			send();
		} else if (e.key === "Escape" && state.running) {
			e.preventDefault();
			stop();
		}
	};
	return { ...state, text, commands, slash, send, stop, onKeyDown };
}
