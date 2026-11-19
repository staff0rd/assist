import { actOnSession } from "./target/actOnSession";

export function closeSession(options: { id?: string } = {}): Promise<void> {
	return actOnSession(options.id, "close", (sessionId) => ({
		type: "dismiss",
		sessionId,
		closeServerRuns: true,
	}));
}
