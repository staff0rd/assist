import { randomUUID } from "node:crypto";
import { requestDaemonReply } from "../sessions/daemon/requestDaemonReply";
import type { PinConfirmResult } from "./PinConfirmResult";

const CONFIRM_TIMEOUT_MS = 15_000;

type ConfirmReply = PinConfirmResult & { requestId?: string; found?: boolean };

export async function forwardPinConfirm(
	area: string,
	pin: string,
): Promise<PinConfirmResult | undefined> {
	const requestId = randomUUID();
	const reply = await requestDaemonReply<ConfirmReply>(
		{ type: "confirm-pin", requestId, area, pin },
		"confirm-pin-result",
		CONFIRM_TIMEOUT_MS,
	);
	if (!reply?.found || reply.requestId !== requestId) return undefined;
	return { ok: reply.ok === true, message: reply.message ?? "" };
}
