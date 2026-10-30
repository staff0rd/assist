import { harnessChoices } from "../../App/AppShell/AppOverlays/NewSessionLayer/NewSessionDialog/harnessChoices";
import { launchNewSession } from "../../App/AppShell/AppOverlays/NewSessionLayer/launchNewSession";
import { useDefaultNewSessionMode } from "../../App/AppShell/AppOverlays/NewSessionLayer/useNewSessionDraft/useDefaultNewSessionMode";
import { useHarnessCapabilities } from "../../useHarnessCapabilities";
import type { SessionSocket } from "../../useSessionSocket";
import { socketLaunchers } from "./socketLaunchers";
import { usePhoneDraftState } from "./usePhoneDraftState";
import { useNodeRepoTarget } from "./useNodeRepoTarget";

export function usePhoneNewSession(socket: SessionSocket, opens: number) {
	const draft = usePhoneDraftState();
	const { names, visible } = socket.nodeSelection;
	const target = useNodeRepoTarget(socket, draft.node, draft.cwd);
	const defaultMode = useDefaultNewSessionMode(target.cwd, opens);
	const mode = draft.mode ?? defaultMode?.mode ?? "prompt";
	const harnesses = harnessChoices(useHarnessCapabilities());
	const harness = harnesses.includes(draft.harness) ? draft.harness : "claude";
	const needsRepo = mode === "draft" || mode === "bug";
	const modeKnown = draft.mode !== undefined || !!defaultMode;

	return {
		...draft,
		...target,
		mode,
		harness,
		harnesses,
		nodes: visible ? names : [],
		links: socket.nodes?.links ?? [],
		canSubmit: modeKnown && (!needsRepo || !!target.cwd),
		submit: () => {
			launchNewSession(
				{
					mode,
					harness,
					prompt: draft.prompt,
					cwd: target.cwd,
					node: visible ? target.node : undefined,
				},
				socketLaunchers(socket),
			);
			draft.setPrompt("");
			draft.setMode(undefined);
		},
	};
}

export type PhoneNewSession = ReturnType<typeof usePhoneNewSession>;
