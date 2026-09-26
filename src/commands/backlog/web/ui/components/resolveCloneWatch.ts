import type { SessionInfo } from "../../../../sessions/web/ui/useSessionSocket";
import {
	type ClonePrompt,
	cloneArgs,
	type LaunchAssist,
	launchClone,
} from "./launchClone";

export type CloneWatch = {
	args: string[];
	target: string;
	node?: string;
	preexisting: Set<string>;
	id?: string;
};

type CloneWatchAction =
	| { type: "latch"; id: string }
	| { type: "done" }
	| { type: "error"; message: string };

function argsEqual(a: string[] | undefined, b: string[]): boolean {
	return !!a && a.length === b.length && a.every((v, i) => v === b[i]);
}

export function startCloneWatch(
	sessions: SessionInfo[],
	prompt: ClonePrompt,
	launchAssist: LaunchAssist,
): CloneWatch {
	const args = cloneArgs(prompt.origin);
	const preexisting = new Set(
		sessions.filter((s) => argsEqual(s.assistArgs, args)).map((s) => s.id),
	);
	launchClone(prompt, launchAssist);
	return {
		args,
		target: prompt.cloneTarget,
		node: prompt.node,
		preexisting,
	};
}

export function resolveCloneWatch(
	sessions: SessionInfo[],
	watch: CloneWatch,
): CloneWatchAction | null {
	if (!watch.id) {
		const match = sessions.find(
			(s) =>
				argsEqual(s.assistArgs, watch.args) && !watch.preexisting.has(s.id),
		);
		return match ? { type: "latch", id: match.id } : null;
	}
	const session = sessions.find((s) => s.id === watch.id);
	if (!session) return null;
	if (session.status === "done") return { type: "done" };
	if (session.status === "error")
		return {
			type: "error",
			message: session.error || "Clone failed.",
		};
	return null;
}
