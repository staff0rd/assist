import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import type { NewSessionMode } from "./newSessionModes";
import { useNodeSelectionContext } from "../../../../useNodeSelectionContext";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import {
	type LoadedDefaultMode,
	useDefaultNewSessionMode,
} from "./useNewSessionDraft/useDefaultNewSessionMode";
import { defaultModeError } from "./useNewSessionDraft/defaultModeError";
import { draftNode } from "./useNewSessionDraft/draftNode";
import { type DraftFocus, useDraftState } from "./useDraftState";

export type NewSessionDraft = {
	prompt: string;
	cwd: string;
	mode: NewSessionMode;
	modePending: boolean;
	modeError: string | undefined;
	retryMode: (() => void) | undefined;
	harness: HarnessKind;
	node: string | undefined;
	focus: DraftFocus;
	setPrompt: (prompt: string) => void;
	setNode: (node: string) => void;
	setCwd: (cwd: string) => void;
	setMode: (mode: NewSessionMode) => void;
	setHarness: (harness: HarnessKind) => void;
	setFocus: (focus: DraftFocus) => void;
	clear: () => void;
};

export function useNewSessionDraft(
	opens: number,
	useDefaultMode: (
		cwd: string,
		opens: number,
	) => LoadedDefaultMode | null = useDefaultNewSessionMode,
): NewSessionDraft | null {
	const { selectedCwd } = useRepoSelectionContext();
	const nodeSelection = useNodeSelectionContext();
	const state = useDraftState();
	const cwd = state.cwd ?? selectedCwd;
	const defaultMode = useDefaultMode(cwd, opens);

	if (!defaultMode) return null;
	return {
		...state,
		cwd,
		mode: state.mode ?? defaultMode.mode,
		modePending: state.mode === undefined && defaultMode.pending,
		modeError: defaultModeError(state.mode, defaultMode),
		retryMode: defaultMode.retry,
		node: draftNode(state.node, nodeSelection),
	};
}
