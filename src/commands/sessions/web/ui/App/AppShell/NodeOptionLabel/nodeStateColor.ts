import type { LinkState } from "../../../../../daemon/links/LinkStatus";

const COLORS: Record<LinkState, string> = {
	connected: "success.main",
	connecting: "warning.main",
	disconnected: "error.main",
	"version-blocked": "error.main",
};

export function nodeStateColor(state: LinkState | undefined): string {
	return state ? COLORS[state] : "success.main";
}
