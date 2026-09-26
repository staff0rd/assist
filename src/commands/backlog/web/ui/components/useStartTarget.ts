import { useMachineNode } from "../../../../sessions/web/ui/useMachineNode";
import { useNodeClones } from "../../../../sessions/web/ui/useNodeClones";
import { useRepoCwd } from "../useRepoCwd";
import { clonePromptFor } from "./clonePromptFor";
import type { ClonePrompt } from "./launchClone";

type StartTarget =
	| { kind: "ready"; cwd?: string; node?: string }
	| { kind: "clone"; prompt: ClonePrompt }
	| { kind: "unavailable"; node: string };

export function useStartTarget(): StartTarget {
	const cwd = useRepoCwd();
	const node = useMachineNode();
	const clone = useNodeClones(cwd ?? "", [node])(node);
	if (!cwd) return { kind: "ready", node };
	if (clone.kind === "cloned") return { kind: "ready", cwd: clone.cwd, node };
	if (clone.kind === "clonable")
		return { kind: "clone", prompt: clonePromptFor(clone, node) };
	return { kind: "unavailable", node: node ?? "this machine" };
}
