import type { HarnessKind } from "../../../../../../../../../../shared/harnesses";
import { launchClone } from "../../../../../../../../../backlog/web/ui/components/launchClone";
import type { NewSessionDraft } from "../../useNewSessionDraft";
import {
	launchNewSession,
	type NewSessionLaunchers,
} from "../../launchNewSession";
import type { useDraftRepos } from "../useDraftRepos";

type DraftTarget = ReturnType<typeof useDraftRepos>["target"];

export type HarnessLaunch = { harness: HarnessKind; model?: string };

export function submitDraft(
	draft: NewSessionDraft,
	{ harness, model }: HarnessLaunch,
	target: DraftTarget,
	launchers: NewSessionLaunchers,
	shiftClicked = false,
): boolean {
	if (target.kind === "blocked" || draft.modePending) return false;
	if (target.kind === "clone") {
		launchClone(target.prompt, launchers.onCreateAssist);
		return true;
	}
	launchNewSession(
		{
			mode: draft.mode,
			harness,
			model,
			prompt: draft.prompt,
			cwd: target.cwd,
			node: draft.node,
			autoApprove: shiftClicked,
			open: shiftClicked,
		},
		launchers,
	);
	draft.clear();
	return true;
}
