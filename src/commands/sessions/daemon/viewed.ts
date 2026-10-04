import type { Handler } from "./routed";

export function viewed(handler: Handler): Handler {
	return (client, m, d) => {
		m.io.trackViewer(client, d);
		handler(client, m, d);
	};
}
