import { clonePromptFor } from "../../../../../../../../backlog/web/ui/components/clonePromptFor";
import type { ClonePrompt } from "../../../../../../../../backlog/web/ui/components/launchClone";
import { useNodeSelectionContext } from "../../../../../useNodeSelectionContext";
import { type NodeClone, useNodeClones } from "../../../../../useNodeClones";

type DraftTarget =
	| { kind: "launch"; cwd: string }
	| { kind: "clone"; prompt: ClonePrompt }
	| { kind: "blocked" };

function toTarget(
	cwd: string,
	node: string | undefined,
	clone: NodeClone,
): DraftTarget {
	if (!cwd) return { kind: "launch", cwd };
	if (clone.kind === "cloned") return { kind: "launch", cwd: clone.cwd };
	if (clone.kind === "clonable")
		return { kind: "clone", prompt: clonePromptFor(clone, node) };
	return { kind: "blocked" };
}

export function useDraftRepos(node: string | undefined, cwd: string) {
	const { names, visible } = useNodeSelectionContext();
	const clones = useNodeClones(cwd, visible ? names : [undefined]);
	return {
		cloneState: clones,
		target: toTarget(cwd, node, clones(node)),
	};
}
