import type { ClonePrompt } from "./launchClone";
import { repoName } from "../../../../sessions/web/ui/repoName";

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
