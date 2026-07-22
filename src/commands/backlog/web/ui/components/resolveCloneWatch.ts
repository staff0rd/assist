import type { AssistLaunchMeta } from "../../../../sessions/web/ui/createSessionAction";
import type { SessionInfo } from "../../../../sessions/web/ui/useSessionSocket";

export type ClonePrompt = {
	origin: string;
	cloneTarget: string;
	displayName: string;
};

export type CloneWatch = {
	args: string[];
	target: string;
	preexisting: Set<string>;
	id?: string;
};

type CloneWatchAction =
	| { type: "latch"; id: string }
	| { type: "done" }
	| { type: "error"; message: string };

type LaunchAssist = (
	assistArgs: string[],
	cwd?: string,
	meta?: AssistLaunchMeta,
) => void;

function argsEqual(a: string[] | undefined, b: string[]): boolean {
	return !!a && a.length === b.length && a.every((v, i) => v === b[i]);
}

export function startCloneWatch(
	sessions: SessionInfo[],
	prompt: ClonePrompt,
	launchAssist: LaunchAssist,
): CloneWatch {
	const args = ["backlog", "clone", prompt.origin];
	const preexisting = new Set(
		sessions.filter((s) => argsEqual(s.assistArgs, args)).map((s) => s.id),
	);
	launchAssist(args, undefined, {
		title: `Clone ${prompt.displayName}`,
		subtitle: prompt.origin,
	});
	return { args, target: prompt.cloneTarget, preexisting };
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
