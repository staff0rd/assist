import { backlogRunArgs } from "../../shared/backlogRunArgs";
import type { Session } from "../createSession";
import { describeHeldWork } from "../worktree/describeHeldWork";
import { checkDurability } from "../worktree/treeDurability";

type TargetLinks = {
	localNode: () => string;
	isConnected: (node: string) => boolean;
};

export function transferRefusal(
	s: Session | undefined,
	target: string,
	links: TargetLinks,
): string | undefined {
	if (!s) return "unknown session";
	if (!backlogRunArgs(s)) return "only backlog run sessions can be transferred";
	if (s.transfer && !s.transfer.error)
		return `already transferring to ${s.transfer.target}`;
	if (!target || target === links.localNode())
		return `the session already runs on ${links.localNode()}`;
	if (!links.isConnected(target)) return `${target} is not connected`;
	return undefined;
}

export async function heldWorkRefusal(s: Session): Promise<string | undefined> {
	const path = s.worktree?.path ?? s.cwd;
	if (!path) return undefined;
	const durability = await checkDurability(path);
	if (durability.durable) return undefined;
	const held = await describeHeldWork(path, durability.reason);
	return `${held.summary} in ${path} — commit and push before transferring`;
}
