import { type FormEvent, type MouseEvent, useRef } from "react";
import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import type { NewSessionLaunchers } from "../launchNewSession";
import type { NewSessionDraft } from "../useNewSessionDraft";
import { submitDraft } from "./useDraftSubmit/submitDraft";
import type { useDraftRepos } from "./useDraftRepos";
import { useQueuedSubmit } from "./useDraftSubmit/useQueuedSubmit";

type DraftTarget = ReturnType<typeof useDraftRepos>["target"];

export function useDraftSubmit(
	draft: NewSessionDraft,
	harness: HarnessKind,
	target: DraftTarget,
	launchers: NewSessionLaunchers,
	onClose: () => void,
) {
	const shiftClicked = useRef(false);
	const requestSubmit = useQueuedSubmit(draft, (autoApprove) => {
		if (submitDraft(draft, harness, target, launchers, autoApprove)) onClose();
	});
	return {
		onSubmit: (e: FormEvent) => {
			e.preventDefault();
			const autoApprove = shiftClicked.current;
			shiftClicked.current = false;
			requestSubmit(autoApprove);
		},
		onSubmitClick: (e: MouseEvent) => {
			shiftClicked.current = e.shiftKey;
		},
	};
}
