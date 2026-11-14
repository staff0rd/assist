import type { KeyboardEvent } from "react";
import { bracketedPaste } from "../../../../../../shared/pasteAndSubmit/bracketedPaste";
import { useSlashSuggestions } from "../../../../slashSuggestions/useSlashSuggestions";
import { useSuggestedSlashCommands } from "../../../../slashSuggestions/useSuggestedSlashCommands";
import type { SessionInfo } from "../../../../types";
import { usePersistedPrompt } from "../../../../usePersistedPrompt";
import { sdkComposerKeyDown } from "./sdkComposerKeyDown";
import { sdkComposerState } from "./sdkComposerState";
import { useAppendQueuedToDraft } from "./useAppendQueuedToDraft";

export function useSdkComposer(
	session: SessionInfo,
	sendInput: (sessionId: string, data: string) => void,
	interruptSession: (sessionId: string) => void,
) {
	const [text, setText] = usePersistedPrompt(`sdk-composer:${session.id}`);
	const commands = useSuggestedSlashCommands(
		session.harness,
		session.cwd,
		session.node,
	);
	const slash = useSlashSuggestions(commands, text, setText);
	useAppendQueuedToDraft(session.id, setText, slash.inputRef);
	const state = sdkComposerState(session);
	const suggestion = text ? undefined : state.suggestion;
	const send = () => {
		if (!text.trim() || !state.enabled) return;
		sendInput(session.id, bracketedPaste(text));
		setText("");
	};
	const stop = () => {
		if (state.running && !state.stopping) interruptSession(session.id);
	};
	const onKeyDown = (e: KeyboardEvent) =>
		sdkComposerKeyDown(e, {
			slash,
			suggestion,
			running: state.running,
			send,
			stop,
		});
	return {
		...state,
		placeholder: suggestion ?? state.placeholder,
		suggestion,
		text,
		commands,
		slash,
		send,
		stop,
		onKeyDown,
	};
}
