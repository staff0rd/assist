import type { NodesState } from "../../../../../../types";
import type { WsDispatch } from "../../../WsDispatch";

export function handleNodes(msg: Record<string, unknown>, d: WsDispatch): void {
	d.setNodes({
		local: msg.local as string,
		links: (msg.links as NodesState["links"]) ?? [],
	});
}
