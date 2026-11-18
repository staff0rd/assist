import type { TransferPlan } from "../../shared/transferPlan";
import type { Session } from "../createSession";
import type { TransferredConversation } from "./TransferredConversation";
import type { TransferSnapshot } from "./TransferSnapshot";

type Launch = {
	target: string;
	cwd: string | undefined;
	traceId: string;
	snapshot: TransferSnapshot | undefined;
	conversation: TransferredConversation | undefined;
};

export function transferLaunchRequest(
	s: Session,
	plan: TransferPlan,
	{ target, cwd, traceId, snapshot, conversation }: Launch,
): Record<string, unknown> {
	const common = {
		cwd,
		node: target,
		title: s.title,
		subtitle: s.subtitle,
		traceId,
		transfer: snapshot,
	};
	if (plan.kind === "backlog-run")
		return { type: "create-assist", assistArgs: plan.args, ...common };
	return { type: "create", harness: "claude", conversation, ...common };
}
