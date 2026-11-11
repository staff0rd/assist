import type { LinkState } from "../../../../../../../../../daemon/links/LinkStatus";

export const linkStateLabel: Record<LinkState, string> = {
	connected: "Connected",
	connecting: "Connecting…",
	disconnected: "Disconnected",
	"version-blocked": "Version blocked",
};
