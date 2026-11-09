import type { Handler } from "./routed";

export const handleUserActivity: Handler = (client, m, d) => {
	const fromPeer = m.clients.isPeer(client);
	m.clients.userActivity.record(fromPeer ? "linked node's web UI" : "web UI");
	if (!fromPeer) m.links.relayUserActivity(d.nodes);
};
