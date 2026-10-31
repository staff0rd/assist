import { sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { Handler } from "../routed";
import { confirmPinLocally } from "./confirmPinLocally";

const CONFIRM_TIMEOUT_MS = 10_000;

const handlePeerConfirm: Handler = (client, m, d) => {
	const area = String(d.area);
	const from = m.clients.peerNode(client) ?? "unknown node";
	void confirmPinLocally(area, String(d.pin)).then((result) => {
		daemonLog(
			`confirm-pin: ${area} confirmation relayed from ${from} ${result.ok ? "approved" : "rejected"}`,
		);
		sendTo(client, {
			type: "confirm-pin-result",
			requestId: d.requestId,
			...result,
		});
	});
};

export const handleConfirmPin: Handler = (client, m, d) => {
	if (m.clients.isPeer(client)) return handlePeerConfirm(client, m, d);
	const area = String(d.area);
	const requestId = String(d.requestId);
	const node = m.links.pins.takeOrigin(area, String(d.pin));
	if (!node) {
		daemonLog(`confirm-pin: no relayed ${area} PIN matches; nothing forwarded`);
		sendTo(client, { type: "confirm-pin-result", requestId, found: false });
		return;
	}
	daemonLog(`confirm-pin: forwarding ${area} confirmation to ${node}`);
	m.links.pins.awaitConfirm(requestId, client, CONFIRM_TIMEOUT_MS, node);
	m.links.route(client, { ...d, node });
};
