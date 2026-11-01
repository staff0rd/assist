import { routed } from "./routed";

export const handleDismiss = routed((_client, m, d) =>
	m.dismissSession(d.sessionId as string, d.closeServerRuns === true),
);
