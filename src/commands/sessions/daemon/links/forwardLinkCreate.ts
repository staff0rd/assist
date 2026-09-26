import { newTraceId } from "../../shared/newTraceId";
import { type SessionClient, sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import { unavailableReason } from "./describeLink";
import type { LinkContext } from "./LinkContext";
import { sendToLink } from "./setLinkState";
import { toPeerMessage } from "./toPeerMessage";

type Msg = Record<string, unknown>;

function armCreateTimeout(ctx: LinkContext, client: SessionClient, data: Msg) {
	const node = ctx.spec.name;
	const timer = setTimeout(() => {
		const pending = ctx.relay.pendingCreators;
		const index = pending.findIndex((p) => p.timer === timer);
		if (index === -1) return;
		pending.splice(index, 1);
		daemonLog(`link ${node} ws: ${data.type} timed out (cwd=${data.cwd})`);
		sendTo(client, {
			type: "error",
			message: `Session on ${node} did not start: the peer did not respond.`,
		});
	}, ctx.deps.createTimeoutMs);
	timer.unref?.();
	ctx.relay.pendingCreators.push({ client, timer });
}

export function forwardLinkCreate(
	ctx: LinkContext,
	client: SessionClient,
	data: Msg,
): void {
	const node = ctx.spec.name;
	if (!ctx.greeted) {
		const reason = unavailableReason(ctx);
		daemonLog(`link ${node} ws: refusing ${data.type}: ${reason}`);
		sendTo(client, {
			type: "error",
			message: `${node} unavailable: ${reason}`,
		});
		return;
	}
	const traceId = newTraceId();
	daemonLog(
		`link ${node} ws: routing ${data.type} (cwd=${data.cwd ?? "default"}) trace=${traceId}`,
	);
	armCreateTimeout(ctx, client, data);
	sendToLink(ctx, { ...toPeerMessage(data), traceId });
}
