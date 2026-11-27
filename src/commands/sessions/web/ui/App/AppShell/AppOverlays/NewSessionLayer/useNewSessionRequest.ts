import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import { type NewSessionMode, newSessionModes } from "./newSessionModes";
import type { NewSessionDraft } from "./useNewSessionDraft";

function parseMode(value: string | null): NewSessionMode | undefined {
	return value && value in newSessionModes
		? (value as NewSessionMode)
		: undefined;
}

export function useNewSessionRequest(
	draft: NewSessionDraft | null,
	open: () => void,
): void {
	const { selectedCwd } = useRepoSelectionContext();
	const [searchParams, setSearchParams] = useSearchParams();
	const prefill = searchParams.get("new");
	const cwd = searchParams.get("newCwd") ?? selectedCwd;
	const mode = parseMode(searchParams.get("newMode"));
	const { setPrompt, setCwd, setMode, setFocus } = draft ?? {};

	useEffect(() => {
		if (prefill === null || !setPrompt || !setCwd || !setMode || !setFocus)
			return;
		if (prefill) {
			setPrompt(prefill);
			setCwd(cwd);
			setFocus({
				field: "prompt",
				selectionStart: prefill.length,
				selectionEnd: prefill.length,
			});
		}
		if (mode) setMode(mode);
		open();
		setSearchParams(
			(params) => {
				params.delete("new");
				params.delete("newCwd");
				params.delete("newMode");
				return params;
			},
			{ replace: true },
		);
	}, [
		prefill,
		cwd,
		mode,
		setPrompt,
		setCwd,
		setMode,
		setFocus,
		open,
		setSearchParams,
	]);
}
