import { randomUUID } from "node:crypto";
import { requestDaemonReply } from "../sessions/daemon/requestDaemonReply";
import { showNotification } from "./showNotification";

const ROUTE_TIMEOUT_MS = 10_000;

type PinNotification = {
	area: string;
	pin: string;
	title: string;
	message: string;
};

type PinDelivery = { delivered: boolean; node?: string };

type RouteReply = { requestId?: string; node?: string };

async function relayToViewerNode(
	notification: PinNotification,
): Promise<string | undefined> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (!sessionId) return undefined;
	const requestId = randomUUID();
	const reply = await requestDaemonReply<RouteReply>(
		{ type: "notify-pin", sessionId, requestId, ...notification },
		"notify-pin-result",
		ROUTE_TIMEOUT_MS,
	);
	if (reply?.requestId !== requestId) return undefined;
	return reply.node;
}

export async function deliverPinNotification(
	notification: PinNotification,
): Promise<PinDelivery> {
	const node = await relayToViewerNode(notification);
	if (node) return { delivered: true, node };
	const { title, message } = notification;
	return { delivered: showNotification({ title, message }) };
}
