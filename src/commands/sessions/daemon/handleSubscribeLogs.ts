import type { Handler } from "./routed";

export const handleSubscribeLogs: Handler = (client, m, d) =>
	m.clients.subscribeLogs(client, d.replay !== false, d.webServer === true);
