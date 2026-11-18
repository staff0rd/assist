import { TRANSFER_UNSUPPORTED, transferPlan } from "../../shared/transferPlan";
import type { Session } from "../createSession";

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
	const plan = transferPlan(s);
	if (!plan) return TRANSFER_UNSUPPORTED;
	if (plan.kind === "prompt" && !(s.worktree?.path ?? s.cwd))
		return "the session has no working tree to transfer";
	if (s.transfer?.queued)
		return `a transfer to ${s.transfer.target} is already pending`;
	if (s.transfer && !s.transfer.error)
		return `already transferring to ${s.transfer.target}`;
	if (!target || target === links.localNode())
		return `the session already runs on ${links.localNode()}`;
	if (!links.isConnected(target)) return `${target} is not connected`;
	return undefined;
}
