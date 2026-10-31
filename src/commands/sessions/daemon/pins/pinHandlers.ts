import type { Handler } from "../routed";
import { handleConfirmPin } from "./handleConfirmPin";
import { handleNotifyPin } from "./handleNotifyPin";

export const pinHandlers: Record<string, Handler> = {
	"notify-pin": handleNotifyPin,
	"notify-pin-result": (_client, m, d) =>
		m.links.pins.settleDelivery(d.requestId, d.delivered === true),
	"confirm-pin": handleConfirmPin,
};
