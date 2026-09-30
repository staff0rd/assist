import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import type { NewSessionDraft } from "./useNewSessionDraft";

export function useNewSessionRequest(
	draft: NewSessionDraft | null,
	open: () => void,
): void {
	const { selectedCwd } = useRepoSelectionContext();
	const [searchParams, setSearchParams] = useSearchParams();
	const prefill = searchParams.get("new");
	const cwd = searchParams.get("newCwd") ?? selectedCwd;
	const { setPrompt, setCwd, setFocus } = draft ?? {};

	useEffect(() => {
		if (prefill === null || !setPrompt || !setCwd || !setFocus) return;
		if (prefill) {
			setPrompt(prefill);
			setCwd(cwd);
			setFocus({
				field: "prompt",
				selectionStart: prefill.length,
				selectionEnd: prefill.length,
			});
		}
		open();
		setSearchParams(
			(params) => {
				params.delete("new");
				params.delete("newCwd");
				return params;
			},
			{ replace: true },
		);
	}, [prefill, cwd, setPrompt, setCwd, setFocus, open, setSearchParams]);
}
