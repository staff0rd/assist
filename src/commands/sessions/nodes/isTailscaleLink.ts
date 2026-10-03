import type { LinkSpec } from "../daemon/links/LinkStatus";

export function isTailscaleLink(spec: LinkSpec): boolean {
	return new URL(spec.url).hostname.endsWith(".ts.net");
}
