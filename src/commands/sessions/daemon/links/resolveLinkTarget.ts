import { sessionRefKeys } from "./isLinkCreate";
import { splitNodeSessionId } from "./splitNodeSessionId";

type Msg = Record<string, unknown>;

type LinkTarget =
	| { kind: "local" }
	| { kind: "link"; node: string }
	| { kind: "unknown"; node: string };

export function resolveLinkTarget(
	data: Msg,
	localNode: string,
	isLinked: (node: string) => boolean,
): LinkTarget {
	for (const key of sessionRefKeys(data.type)) {
		const value = data[key];
		if (typeof value !== "string") continue;
		const split = splitNodeSessionId(value);
		if (!split) return { kind: "local" };
		return byNode(split.node, localNode, isLinked);
	}
	if (typeof data.node === "string" && data.node)
		return byNode(data.node, localNode, isLinked);
	return { kind: "local" };
}

function byNode(
	node: string,
	localNode: string,
	isLinked: (node: string) => boolean,
): LinkTarget {
	if (node === localNode) return { kind: "local" };
	return isLinked(node) ? { kind: "link", node } : { kind: "unknown", node };
}
