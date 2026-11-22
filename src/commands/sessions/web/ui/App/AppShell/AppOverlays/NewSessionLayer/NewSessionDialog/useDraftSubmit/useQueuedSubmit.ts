import { useEffect, useState } from "react";
import type { NewSessionDraft } from "../../useNewSessionDraft";
import type { SubmitFlags } from "./submitDraft";

export function useQueuedSubmit(
	draft: NewSessionDraft,
	submit: (flags: SubmitFlags) => void,
) {
	const [queued, setQueued] = useState<SubmitFlags | null>(null);

	useEffect(() => {
		if (!queued || draft.modePending) return;
		setQueued(null);
		if (!draft.modeError) submit(queued);
	}, [queued, draft.modePending, draft.modeError, submit]);

	return (flags: SubmitFlags) => {
		if (draft.modePending) setQueued(flags);
		else submit(flags);
	};
}
