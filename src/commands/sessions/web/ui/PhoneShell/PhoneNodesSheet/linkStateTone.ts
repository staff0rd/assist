import type { LinkStatus } from "../../../../daemon/links/LinkStatus";
import type { NodeDotTone } from "../../HomeNodeGate/NodeDot";

export const linkStateTone: Record<LinkStatus["state"], NodeDotTone> = {
	connected: "ok",
	connecting: "warn",
	disconnected: "error",
	"version-blocked": "error",
};
