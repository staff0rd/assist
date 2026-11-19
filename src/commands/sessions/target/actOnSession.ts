import { sendToCurrentSession } from "./sendToCurrentSession";
import { sendToSession } from "./sendToSession";

export function actOnSession(
	id: string | undefined,
	verb: string,
	build: (sessionId: string) => Record<string, unknown>,
): Promise<void> {
	return id === undefined
		? sendToCurrentSession(verb, build)
		: sendToSession(id, build);
}
