import type { Handler } from "../routed";
import { handleNotifyPin } from "./handleNotifyPin";

export const pinHandlers: Record<string, Handler> = {
	"notify-pin": handleNotifyPin,
	"notify-pin-result": (_client, m, d) =>
		m.links.pins.settleDelivery(d.requestId, d.delivered === true),
};
