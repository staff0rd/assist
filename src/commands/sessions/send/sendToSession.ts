import { requestTypeIntoSession } from "../daemon/requestTypeIntoSession";
import { decodeKeys } from "./decodeKeys";

type SendOptions = { keys?: boolean };

export async function sendToSession(
	sessionId: string,
	text: string,
	options: SendOptions,
): Promise<void> {
	try {
		const reply = await requestTypeIntoSession(
			options.keys
				? { type: "type-keys", sessionId, text: decodeKeys(text) }
				: { type: "type-prompt", sessionId, text, ...sender() },
		);
		if (reply.ok) console.log(reply.message);
		else fail(reply.message);
	} catch (error) {
		fail(error instanceof Error ? error.message : String(error));
	}
}

function sender(): { fromSessionId?: string } {
	const fromSessionId = process.env.ASSIST_SESSION_ID;
	return fromSessionId ? { fromSessionId } : {};
}

function fail(message: string): void {
	console.error(message);
	process.exitCode = 1;
}
