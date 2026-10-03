import {
	defaultTunnelPort,
	type LinkConfig,
	toLinkSpec,
} from "../shared/loadLinkSpecs";
import { tailscaleLinkUrl } from "./tailscaleLinkUrl";
import { parsePort } from "./parsePort";
import { parseLinkUrl } from "./parseLinkUrl";

export type LinkOptions = {
	ssh?: string;
	tailscale?: string;
	port?: string;
	localPort?: string;
};

export async function buildLink(
	name: string,
	url: string | undefined,
	options: LinkOptions,
	others: LinkConfig[],
	resolveTailnetSuffix?: () => Promise<string>,
): Promise<LinkConfig> {
	if ([url, options.ssh, options.tailscale].filter(Boolean).length > 1)
		throw new Error(
			"pass only one of <url>, --tailscale <host> or --ssh <alias>",
		);
	if (url) return { name, url: parseLinkUrl(url) };
	if (options.tailscale) {
		const port = parsePort("--port", options.port);
		return {
			name,
			url: await tailscaleLinkUrl(
				options.tailscale,
				port,
				resolveTailnetSuffix,
			),
		};
	}
	if (!options.ssh)
		throw new Error(
			"pass the peer's <url>, --tailscale <host> --port <port> or --ssh <alias> --port <port>",
		);
	const port = parsePort("--port", options.port);
	const localPort = options.localPort
		? parsePort("--local-port", options.localPort)
		: freeTunnelPort(port, others);
	return { name, ssh: options.ssh, port, localPort };
}

function freeTunnelPort(port: number, others: LinkConfig[]): number {
	const taken = new Set(others.map((link) => toLinkSpec(link).ssh?.localPort));
	let candidate = defaultTunnelPort(port);
	while (taken.has(candidate)) candidate++;
	return candidate;
}
