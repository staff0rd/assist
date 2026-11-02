import type { HarnessKind } from "../../../../../../../../../../shared/harnesses";
import { launchClone } from "../../../../../../../../../backlog/web/ui/components/launchClone";
import type { NewSessionDraft } from "../../useNewSessionDraft";
import {
	launchNewSession,
	type NewSessionLaunchers,
} from "../../launchNewSession";
import type { useDraftRepos } from "../useDraftRepos";

type DraftTarget = ReturnType<typeof useDraftRepos>["target"];

export function submitDraft(
	draft: NewSessionDraft,
	harness: HarnessKind,
	target: DraftTarget,
	launchers: NewSessionLaunchers,
	autoApprove = false,
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
			prompt: draft.prompt,
			cwd: target.cwd,
			node: draft.node,
			autoApprove,
		},
		launchers,
	);
	draft.clear();
	return true;
}
