import { type IncomingMessage, type ServerResponse } from "node:http";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";
import { resolveNodeName } from "../shared/resolveNodeName";
import { forwardToPeer } from "./forwardToPeer";

const LINKED_FROM_HEADER = "x-assist-linked-from";

type ProxyTarget =
	| { kind: "local" }
	| { kind: "unknown"; node: string }
	| { kind: "link"; node: string; url: URL };

function arrivedOverLink(req: IncomingMessage): boolean {
	return Boolean(req.headers[LINKED_FROM_HEADER]);
}

function proxyTarget(req: IncomingMessage): ProxyTarget {
	const url = new URL(req.url ?? "/", "http://localhost");
	const node = url.searchParams.get("node");
	if (!url.pathname.startsWith("/api/") || !node) return { kind: "local" };
	if (arrivedOverLink(req) || node === resolveNodeName())
		return { kind: "local" };
	const link = loadConfig().sessions?.links?.find((l) => l.name === node);
	if (!link) return { kind: "unknown", node };
	url.searchParams.delete("node");
	return {
		kind: "link",
		node,
		url: new URL(`${url.pathname}${url.search}`, link.url),
	};
}

export async function proxyToNode(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<boolean> {
	const target = proxyTarget(req);
	if (target.kind === "local") return false;
	if (target.kind === "unknown") {
		console.log(
			`link ${target.node} http: ${req.method} ${req.url} -> no such link`,
		);
		respondJson(res, 404, { error: `No link to node ${target.node}` });
		return true;
	}
	await forwardToPeer(req, res, target.node, target.url);
	return true;
}
