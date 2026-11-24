import type { useSlashSuggestions } from "../../../../slashSuggestions/useSlashSuggestions";
import { sdkComposerOnKeyDown } from "./sdkComposerOnKeyDown";
import { sdkComposerSendStop } from "./sdkComposerSendStop";

type SendStop = Parameters<typeof sdkComposerSendStop>;

export function composerSendKeys(
	draft: SendStop[0],
	state: SendStop[1],
	shell: SendStop[2],
	slash: ReturnType<typeof useSlashSuggestions>,
	targets: SendStop[3],
	recallQueued?: () => void,
) {
	const { send, stop } = sdkComposerSendStop(draft, state, shell, targets);
	const onKeyDown = sdkComposerOnKeyDown({
		text: draft.text,
		shell,
		slash,
		suggestion: draft.suggestion,
		running: state.running,
		send,
		stop,
		recallQueued,
	});
	return { send, stop, onKeyDown };
}
