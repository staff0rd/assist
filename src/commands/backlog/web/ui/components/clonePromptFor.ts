import { repoName } from "../../../../sessions/web/ui/RepoList";
import type { ClonePrompt } from "./launchClone";

export function clonePromptFor(
	clone: { origin: string; cloneTarget: string },
	node: string | undefined,
): ClonePrompt {
	return {
		origin: clone.origin,
		cloneTarget: clone.cloneTarget,
		displayName: repoName(clone.origin),
		node,
	};
}
