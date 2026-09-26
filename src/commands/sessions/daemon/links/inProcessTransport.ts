import { dispatchMessage } from "../dispatchMessage";
import { type InProcessPeer, inProcessClient } from "./inProcessClient";
import type { LinkTransport } from "./LinkTransport";

export function inProcessTransport(
	peers: Map<string, InProcessPeer>,
	onBuildHello: (nodeName: string) => void,
) {
	const drops: ((reason: string) => void)[] = [];
	const transport: LinkTransport = async (url, handlers) => {
		const peer = peers.get(url);
		if (!peer) throw new Error(`connect ECONNREFUSED ${url}`);
		const { client, conn, close } = inProcessClient(peer, handlers);
		drops.push((reason) => {
			close();
			handlers.onClose(reason);
		});
		return {
			send: (line) => {
				if (!conn.open) return false;
				onBuildHello(peer.name);
				dispatchMessage(client, peer.manager, JSON.parse(line));
				return true;
			},
			close,
		};
	};
	const dropAll = (reason: string) => {
		for (const drop of drops.splice(0)) drop(reason);
	};
	return { transport, dropAll };
}
