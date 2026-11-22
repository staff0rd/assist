import { type FormEvent, type MouseEvent, useRef } from "react";
import type { NewSessionLaunchers } from "../launchNewSession";
import type { NewSessionDraft } from "../useNewSessionDraft";
import {
	type HarnessLaunch,
	type SubmitFlags,
	submitDraft,
} from "./useDraftSubmit/submitDraft";
import type { useDraftRepos } from "./useDraftRepos";
import { submitFlagsFor } from "./useDraftSubmit/submitFlagsFor";
import { useQueuedSubmit } from "./useDraftSubmit/useQueuedSubmit";

type DraftTarget = ReturnType<typeof useDraftRepos>["target"];

export function useDraftSubmit(
	draft: NewSessionDraft,
	harness: HarnessLaunch,
	target: DraftTarget,
	launchers: NewSessionLaunchers,
	onClose: () => void,
) {
	const clicked = useRef<SubmitFlags>({});
	const requestSubmit = useQueuedSubmit(draft, (flags) => {
		if (submitDraft(draft, harness, target, launchers, flags)) onClose();
	});
	return {
		onSubmit: (e: FormEvent) => {
			e.preventDefault();
			const flags = clicked.current;
			clicked.current = {};
			requestSubmit(flags);
		},
		onSubmitClick: (e: MouseEvent) => {
			clicked.current = submitFlagsFor(e);
		},
	};
}
