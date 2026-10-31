import { sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { Handler } from "../routed";
import { pinNotificationTarget } from "./pinNotificationTarget";

const DELIVERY_TIMEOUT_MS = 5_000;

export const handleNotifyPin: Handler = (client, m, d) => {
	const { sessionId, requestId, area } = d;
	const reply = (node?: string) =>
		sendTo(client, { type: "notify-pin-result", requestId, node });
	const target = pinNotificationTarget(
		m.localSessions().find((s) => s.id === sessionId)?.activeViewerNode,
		m.links.localNode(),
		(node) => m.clients.peerFor(node),
	);
	if (target.kind === "local") {
		daemonLog(
			`notify-pin: session ${sessionId} ${target.reason}; ${area} PIN notifies locally`,
		);
		return reply();
	}
	daemonLog(
		`notify-pin: session ${sessionId} relaying ${area} PIN notification to ${target.node}`,
	);
	m.links.pins.awaitDelivery(
		String(requestId),
		DELIVERY_TIMEOUT_MS,
		(delivered) => {
			daemonLog(
				`notify-pin: session ${sessionId} ${area} PIN ${delivered ? `shown on ${target.node}` : `not shown on ${target.node}; notifying locally`}`,
			);
			reply(delivered ? target.node : undefined);
		},
	);
	const { title, message, pin } = d;
	sendTo(target.peer, {
		type: "notify-pin",
		requestId,
		area,
		pin,
		title,
		message,
	});
};
