import {
	splitNodeSessionId,
	toNodeSessionId,
} from "../../../../../../../../../daemon/links/splitNodeSessionId";

/* why: a bare sender id is local to the node whose transcript holds it, so
 * it is qualified with that node unless the viewer is on the same node. */
export function senderSessionId(
	from: string,
	transcriptNode: string | undefined,
	localNode: string | undefined,
): string {
	const split = splitNodeSessionId(from);
	const node = split ? split.node : transcriptNode;
	const id = split ? split.id : from;
	return node && node !== localNode ? toNodeSessionId(node, id) : id;
}
