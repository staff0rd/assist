import { defaultModeError } from "../../App/AppShell/AppOverlays/NewSessionLayer/useNewSessionDraft/defaultModeError";
import { useDefaultNewSessionMode } from "../../App/AppShell/AppOverlays/NewSessionLayer/useNewSessionDraft/useDefaultNewSessionMode";
import type { SessionSocket } from "../../useSessionSocket";
import { submitPhoneDraft } from "./submitPhoneDraft";
import { usePhoneDraftState } from "./usePhoneDraftState";
import { usePhoneModeHarness } from "./usePhoneModeHarness";
import { useNodeRepoTarget } from "./useNodeRepoTarget";

export function usePhoneNewSession(socket: SessionSocket, opens: number) {
	const draft = usePhoneDraftState();
	const { names, visible } = socket.nodeSelection;
	const target = useNodeRepoTarget(socket, draft.node, draft.cwd);
	const defaultMode = useDefaultNewSessionMode(target.cwd, opens);
	const mode = draft.mode ?? defaultMode?.mode ?? "prompt";
	const { harness, harnesses, model } = usePhoneModeHarness(
		visible ? target.node : undefined,
		draft,
		defaultMode,
		mode,
	);
	const needsRepo = mode === "draft" || mode === "bug";
	const modeKnown = draft.mode !== undefined || !!defaultMode;

	return {
		...draft,
		...target,
		mode,
		modeError: defaultModeError(draft.mode, defaultMode),
		retryMode: defaultMode?.retry,
		harness,
		harnesses,
		model,
		nodes: visible ? names : [],
		links: socket.nodes?.links ?? [],
		canSubmit: modeKnown && (!needsRepo || !!target.cwd),
		submit: () =>
			submitPhoneDraft(socket, draft, {
				mode,
				harness,
				model: model?.model,
				cwd: target.cwd,
				node: visible ? target.node : undefined,
			}),
	};
}

export type PhoneNewSession = ReturnType<typeof usePhoneNewSession>;
