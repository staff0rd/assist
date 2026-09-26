import { loadConfig } from "../../../shared/loadConfig";
import type { AssistConfig } from "../../../shared/types";
import type { LinkSpec } from "../daemon/links/LinkStatus";

export type LinkConfig = NonNullable<
	NonNullable<AssistConfig["sessions"]>["links"]
>[number];

const TUNNEL_PORT_BASE = 43_000;

export function defaultTunnelPort(port: number): number {
	return TUNNEL_PORT_BASE + (port % 1000);
}

export function toLinkSpec(link: LinkConfig): LinkSpec {
	if ("url" in link) return { name: link.name, url: link.url };
	const localPort = link.localPort ?? defaultTunnelPort(link.port);
	return {
		name: link.name,
		url: `http://127.0.0.1:${localPort}`,
		ssh: { alias: link.ssh, port: link.port, localPort },
	};
}

export function loadLinkSpecs(): LinkSpec[] {
	return (loadConfig().sessions?.links ?? []).map(toLinkSpec);
}

export function findLinkSpec(name: string): LinkSpec | undefined {
	return loadLinkSpecs().find((spec) => spec.name === name);
}
