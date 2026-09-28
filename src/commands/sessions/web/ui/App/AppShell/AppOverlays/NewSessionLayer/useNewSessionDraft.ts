import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import type { NewSessionMode } from "./newSessionModes";
import { useNodeSelectionContext } from "../../../../useNodeSelectionContext";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import { useDefaultNewSessionMode } from "./useDefaultNewSessionMode";
import { draftNode } from "./useNewSessionDraft/draftNode";
import {
	type DraftFocus,
	useDraftState,
} from "./useNewSessionDraft/useDraftState";

export type NewSessionDraft = {
	prompt: string;
	cwd: string;
	mode: NewSessionMode;
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
	useDefaultMode: (
		cwd: string,
	) => NewSessionMode | null = useDefaultNewSessionMode,
): NewSessionDraft | null {
	const { selectedCwd } = useRepoSelectionContext();
	const nodeSelection = useNodeSelectionContext();
	const state = useDraftState();
	const cwd = state.cwd ?? selectedCwd;
	const defaultMode = useDefaultMode(cwd);

	if (!defaultMode) return null;
	return {
		...state,
		cwd,
		mode: state.mode ?? defaultMode,
		node: draftNode(state.node, nodeSelection),
	};
}
