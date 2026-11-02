import { useEffect, useState } from "react";
import type { NewSessionDraft } from "../../useNewSessionDraft";

export function useQueuedSubmit(
	draft: NewSessionDraft,
	submit: (autoApprove: boolean) => void,
) {
	const [queued, setQueued] = useState<{ autoApprove: boolean } | null>(null);

	useEffect(() => {
		if (!queued || draft.modePending) return;
		setQueued(null);
		if (!draft.modeError) submit(queued.autoApprove);
	}, [queued, draft.modePending, draft.modeError, submit]);

	return (autoApprove: boolean) => {
		if (draft.modePending) setQueued({ autoApprove });
		else submit(autoApprove);
	};
}
