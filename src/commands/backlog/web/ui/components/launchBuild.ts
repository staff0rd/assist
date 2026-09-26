import type { AssistLaunchMeta } from "../../../../sessions/web/ui/createSessionAction";
import { formatItemId } from "../../../formatItemId";
import type { LaunchAssist } from "./launchClone";

export function launchBuild(
	launchAssist: LaunchAssist,
	itemId: number,
	target: { cwd?: string; node?: string },
	harnessArgs: string[],
): void {
	const meta: [AssistLaunchMeta?] = target.node ? [{ node: target.node }] : [];
	launchAssist(
		["backlog", "run", formatItemId(itemId), ...harnessArgs],
		target.cwd,
		...meta,
	);
}
