import { useEffect, useState } from "react";
import type { NewSessionDraft } from "../useNewSessionDraft";

export function useQueuedSubmit(draft: NewSessionDraft, submit: () => void) {
	const [queued, setQueued] = useState(false);

	useEffect(() => {
		if (!queued || draft.modePending) return;
		setQueued(false);
		if (draft.mode === "prompt" && !draft.prompt.trim()) return;
		submit();
	}, [queued, draft.modePending, draft.mode, draft.prompt, submit]);

	return () => {
		if (draft.modePending) setQueued(true);
		else submit();
	};
}
