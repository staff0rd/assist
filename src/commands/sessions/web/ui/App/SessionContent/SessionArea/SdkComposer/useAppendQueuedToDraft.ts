import type { RefObject, SetStateAction } from "react";
import { appendToDraft } from "./appendToDraft";
import { useRegisterComposerDraft } from "./useComposerDraft";

export function useAppendQueuedToDraft(
	sessionId: string | undefined,
	setText: (next: SetStateAction<string>) => void,
	inputRef: RefObject<HTMLTextAreaElement | null>,
): void {
	useRegisterComposerDraft(sessionId, (queued) => {
		setText((draft) => appendToDraft(draft, queued));
		inputRef.current?.focus();
	});
}
