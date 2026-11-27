import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import {
	newSessionParamNames,
	readNewSessionParams,
} from "./readNewSessionParams";
import type { NewSessionDraft } from "./useNewSessionDraft";

export function useNewSessionRequest(
	draft: NewSessionDraft | null,
	open: () => void,
): void {
	const { selectedCwd } = useRepoSelectionContext();
	const [searchParams, setSearchParams] = useSearchParams();
	const request = readNewSessionParams(searchParams);
	const { prefill, mode, node } = request;
	const cwd = request.cwd ?? selectedCwd;
	const { setPrompt, setCwd, setMode, setNode, setFocus } = draft ?? {};

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
		if (mode) setMode?.(mode);
		if (node) setNode?.(node);
		open();
		setSearchParams(
			(params) => {
				for (const name of newSessionParamNames) params.delete(name);
				return params;
			},
			{ replace: true },
		);
	}, [
		prefill,
		cwd,
		mode,
		node,
		setPrompt,
		setCwd,
		setMode,
		setNode,
		setFocus,
		open,
		setSearchParams,
	]);
}
