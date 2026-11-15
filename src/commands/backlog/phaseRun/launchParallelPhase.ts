import { randomUUID } from "node:crypto";
import { requestAssistSession } from "../../sessions/shared/requestAssistSession";
import { appendDaemonLog } from "../../sessions/daemon/appendDaemonLog";
import { formatItemId } from "../formatItemId";
import { getReady } from "../shared";
import type { BacklogItem, BacklogRunOptions } from "../types";
import { phaseGit } from "./phaseGit";
import { setPhaseRunState } from "./setPhaseRunState";

function harnessArgs(spawnOptions?: BacklogRunOptions): string[] {
	return [
		...(spawnOptions?.harness ? ["--harness", spawnOptions.harness] : []),
		...(spawnOptions?.model ? ["--model", spawnOptions.model] : []),
		...(spawnOptions?.allowEdits === false ? ["--no-write"] : []),
	];
}

/** Start a phase in its own daemon session and worktree, branched from the item tree's HEAD. */
export async function launchParallelPhase(
	item: BacklogItem,
	idx: number,
	itemTree: string,
	spawnOptions?: BacklogRunOptions,
): Promise<boolean> {
	const token = randomUUID();
	const { orm } = await getReady();
	await setPhaseRunState(orm, item.id, [idx], "running", token);
	const head = phaseGit(["rev-parse", "HEAD"], itemTree).out;
	const args = [
		"backlog",
		"run-phase",
		formatItemId(item.id),
		String(idx + 1),
		"--token",
		token,
		"--item-tree",
		itemTree,
		...harnessArgs(spawnOptions),
	];
	try {
		const sessionId = await requestAssistSession(args, itemTree, {
			startPoint: head,
		});
		appendDaemonLog(
			`backlog run ${item.id}: started phase ${idx + 1} in session ${sessionId} off ${head.slice(0, 8)}`,
		);
		return true;
	} catch (error) {
		await setPhaseRunState(orm, item.id, [idx], null);
		appendDaemonLog(
			`backlog run ${item.id}: could not start phase ${idx + 1} in its own session (${String(error)}); running phases one at a time`,
		);
		return false;
	}
}
