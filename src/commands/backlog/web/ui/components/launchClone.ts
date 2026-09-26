import type { AssistLaunchMeta } from "../../../../sessions/web/ui/createSessionAction";

export type ClonePrompt = {
	origin: string;
	cloneTarget: string;
	displayName: string;
	node?: string;
};

export type LaunchAssist = (
	assistArgs: string[],
	cwd?: string,
	meta?: AssistLaunchMeta,
) => void;

export function cloneArgs(origin: string): string[] {
	return ["backlog", "clone", origin];
}

export function launchClone(
	prompt: ClonePrompt,
	launchAssist: LaunchAssist,
): void {
	launchAssist(cloneArgs(prompt.origin), undefined, {
		title: `Clone ${prompt.displayName}`,
		subtitle: prompt.origin,
		...(prompt.node && { node: prompt.node }),
	});
}
