import type { KeyboardEvent } from "react";
import { useSlashSuggestions } from "../../../../slashSuggestions/useSlashSuggestions";
import type { SessionInfo } from "../../../../types";
import { usePersistedPrompt } from "../../../../usePersistedPrompt";
import { composerPlaceholder } from "./composerPlaceholder";
import { heldShellCount } from "./heldShellCount";
import { sdkComposerKeyDown } from "./sdkComposerKeyDown";
import { sdkComposerSendStop } from "./sdkComposerSendStop";
import { sdkComposerState } from "./sdkComposerState";
import { shellAwareEdit } from "./shellAwareEdit";
import { useAppendQueuedToDraft } from "./useAppendQueuedToDraft";
import { useComposerCommands } from "./useComposerCommands";
import { useComposerShell } from "./useComposerShell";

export function useSdkComposer(
	session: SessionInfo,
	sendInput: (sessionId: string, data: string) => void,
	interruptSession: (sessionId: string) => void,
) {
	const [text, setText] = usePersistedPrompt(`sdk-composer:${session.id}`);
	const shell = useComposerShell(session.id);
	const commands = useComposerCommands(session, shell.shell);
	const slash = useSlashSuggestions(commands, text, setText);
	useAppendQueuedToDraft(session.id, setText, slash.inputRef);
	const state = sdkComposerState(session);
	const suggestion = text || shell.shell ? undefined : state.suggestion;
	const { send, stop } = sdkComposerSendStop({ text, setText }, state, shell, {
		sessionId: session.id,
		sendInput,
		interruptSession,
	});
	const onKeyDown = (e: KeyboardEvent) =>
		shell.leaveOnBackspace(e, text) ||
		sdkComposerKeyDown(e, {
			slash,
			suggestion,
			running: state.running,
			send,
			stop,
		});
	return {
		...state,
		placeholder: composerPlaceholder(
			shell.shell,
			suggestion,
			state.placeholder,
		),
		suggestion,
		shell: shell.shell,
		held: heldShellCount(session),
		text,
		commands,
		slash,
		edit: shellAwareEdit(shell, slash),
		send,
		stop,
		onKeyDown,
	};
}
