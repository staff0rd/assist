import { defaultNodeName } from "./defaultNodeName";
import { parseNodeUrl } from "./parseNodeUrl";
import type { SavedNode } from "./SavedNode";

type AddNodeLinkResult =
	| { ok: true; node: SavedNode }
	| { ok: false; error: string };

function parseLink(link: string): URL | undefined {
	try {
		return new URL(link);
	} catch {
		return undefined;
	}
}

function isAddNodeLink(url: URL): boolean {
	return (
		url.protocol === "assist:" &&
		url.hostname === "add-node" &&
		(url.pathname === "" || url.pathname === "/")
	);
}

export function parseAddNodeLink(link: string): AddNodeLinkResult {
	const parsed = parseLink(link);
	if (!parsed || !isAddNodeLink(parsed))
		return { ok: false, error: `Not an assist add-node link: ${link}` };
	const rawUrl = parsed.searchParams.get("url");
	const url = rawUrl ? parseNodeUrl(rawUrl) : undefined;
	if (!url)
		return {
			ok: false,
			error: `The link has no valid node URL: ${rawUrl ?? "(missing)"}`,
		};
	const name = parsed.searchParams.get("name")?.trim() || defaultNodeName(url);
	return { ok: true, node: { name, url } };
}
