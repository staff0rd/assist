import type { HarnessKind } from "../../../../../../shared/harnesses";
import { launchNewSession } from "../../App/AppShell/AppOverlays/NewSessionLayer/launchNewSession";
import type { NewSessionMode } from "../../App/AppShell/AppOverlays/NewSessionLayer/newSessionModes";
import type { SessionSocket } from "../../useSessionSocket";
import { socketLaunchers } from "./socketLaunchers";
import type { usePhoneDraftState } from "./usePhoneDraftState";

type Launch = {
	mode: NewSessionMode;
	harness: HarnessKind;
	model: string | undefined;
	cwd: string;
	node: string | undefined;
};

export function submitPhoneDraft(
	socket: SessionSocket,
	draft: ReturnType<typeof usePhoneDraftState>,
	launch: Launch,
): void {
	launchNewSession(
		{ ...launch, prompt: draft.prompt },
		socketLaunchers(socket),
	);
	draft.setPrompt("");
	draft.setMode(undefined);
	draft.setHarness(undefined);
	draft.setPickedModel(undefined);
}
