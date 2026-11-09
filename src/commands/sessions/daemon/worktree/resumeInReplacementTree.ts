import { existsSync } from "node:fs";
import { harnessAdapter } from "../../../../shared/harnessAdapters/harnessAdapter";
import { conversationRecoveryFeature } from "../../../../shared/harnessAdapters/harnessFeatures";
import { launchBlocker } from "../../../../shared/harnessAdapters/launchBlocker";
import type { HarnessKind } from "../../../../shared/harnesses";
import { daemonLog } from "../daemonLog";
import { resumeSession } from "../resumeSession";
import { allocateAndBind, type TreeSpawnContext } from "./allocateAndBind";
import { worktreeAttributionIncludingReaped } from "./readWorktreeRegistry";

export function resumeInReplacementTree(
	ctx: TreeSpawnContext,
	conversationId: string,
	missingCwd: string,
	name: string | undefined,
	harness?: HarnessKind,
): string {
	const adapter = harnessAdapter(harness);
	const blocker = launchBlocker(adapter, conversationRecoveryFeature);
	if (blocker) {
		daemonLog(
			`resume ${conversationId} refused: its tree ${missingCwd} is gone and ${blocker.replaceAll("\n", " ")}`,
		);
		throw new Error(blocker);
	}
	const clone = cloneForReapedTree(missingCwd);
	daemonLog(
		`resuming ${adapter.label} conversation ${conversationId}: its tree ${missingCwd} is gone, allocating from clone ${clone}`,
	);
	return allocateAndBind(
		ctx,
		clone,
		(id, resolvedCwd, holdUntilSeeded) => {
			const cwd = resolvedCwd ?? clone;
			adapter.conversation.relocate(conversationId, missingCwd, cwd);
			daemonLog(`session ${id} resuming ${conversationId} in ${cwd}`);
			return resumeSession(
				id,
				conversationId,
				cwd,
				name,
				holdUntilSeeded,
				harness,
			);
		},
		{ replacesTree: missingCwd },
	);
}

function cloneForReapedTree(missingCwd: string): string {
	const clone = worktreeAttributionIncludingReaped(missingCwd)?.clone;
	if (!clone || !existsSync(clone))
		throw new Error(
			`working directory no longer exists and no clone is recorded to re-allocate from: ${missingCwd}`,
		);
	return clone;
}
