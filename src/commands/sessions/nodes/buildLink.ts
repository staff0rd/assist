import type { LinkSpec } from "../daemon/links/LinkStatus";
import { tailscaleLinkUrl } from "./tailscaleLinkUrl";
import { parsePort } from "./parsePort";
import { parseLinkUrl } from "./parseLinkUrl";

export type LinkOptions = {
	tailscale?: string;
	port?: string;
};

export async function buildLink(
	name: string,
	url: string | undefined,
	options: LinkOptions,
	resolveTailnetSuffix?: () => Promise<string>,
): Promise<LinkSpec> {
	if (url && options.tailscale)
		throw new Error("pass only one of <url> or --tailscale <host>");
	if (url) return { name, url: parseLinkUrl(url) };
	if (!options.tailscale)
		throw new Error(
			"pass the peer's <url> or --tailscale <host> --port <port>",
		);
	const port = parsePort("--port", options.port);
	return {
		name,
		url: await tailscaleLinkUrl(options.tailscale, port, resolveTailnetSuffix),
	};
}
