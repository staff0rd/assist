import { showNotification } from "../../../notify/showNotification";
import { daemonLog } from "../daemonLog";
import type { LinkContext } from "./LinkContext";
import { sendToLink } from "./setLinkState";

type Msg = Record<string, unknown>;

function tryShow(title: unknown, message: unknown): boolean {
	if (typeof title !== "string" || typeof message !== "string") return false;
	try {
		return showNotification({ title, message });
	} catch {
		return false;
	}
}

export function showRelayedPin(ctx: LinkContext, msg: Msg): void {
	const node = ctx.spec.name;
	const { area, pin } = msg;
	const valid = typeof area === "string" && typeof pin === "string";
	const delivered = valid && tryShow(msg.title, msg.message);
	if (delivered) ctx.deps.pins.rememberOrigin(area, pin, node);
	daemonLog(
		`link ${node} ws: ${valid ? area : "malformed"} PIN notification for a session on ${node} ${delivered ? "shown" : "not shown"}`,
	);
	sendToLink(ctx, {
		type: "notify-pin-result",
		requestId: msg.requestId,
		delivered,
	});
}
