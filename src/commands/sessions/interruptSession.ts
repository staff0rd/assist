import { actOnSession } from "./target/actOnSession";

export function interruptSession(options: { id?: string } = {}): Promise<void> {
	return actOnSession(options.id, "interrupt", (sessionId) => ({
		type: "interrupt",
		sessionId,
	}));
}
