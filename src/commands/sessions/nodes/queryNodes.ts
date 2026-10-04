import type { NodesMessage } from "../daemon/links/LinkStatus";
import { requestDaemonReply } from "../daemon/requestDaemonReply";

export function queryNodes(): Promise<NodesMessage | undefined> {
	return requestDaemonReply<NodesMessage>({ type: "nodes" }, "nodes");
}
