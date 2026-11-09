import { type SessionClient, sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { SessionManager } from "./SessionManager";

type Msg = Record<string, unknown>;
type Handler = (
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
) => void;
type SpawnResult = string | { error: string };

export function creator(
	isNew: boolean,
	spawn: (m: SessionManager, d: Msg) => SpawnResult | Promise<SpawnResult>,
): Handler {
	const reply = (client: SessionClient, d: Msg, result: SpawnResult) => {
		const traceId = typeof d.traceId === "string" ? d.traceId : undefined;
		if (typeof result !== "string") {
			sendTo(client, { type: "error", message: result.error, traceId });
			return;
		}
		sendTo(client, { type: "created", sessionId: result, isNew, traceId });
	};
	const fail = (client: SessionClient, d: Msg, error: unknown) => {
		const reason = error instanceof Error ? error.message : String(error);
		daemonLog(`${d.type} failed: ${reason}`);
		reply(client, d, { error: `${d.type} failed: ${reason}` });
	};
	return (client, m, d) => {
		if (m.links.route(client, d)) return;
		let result: SpawnResult | Promise<SpawnResult>;
		try {
			result = spawn(m, d);
		} catch (error) {
			fail(client, d, error);
			return;
		}
		if (result instanceof Promise)
			result.then(
				(resolved) => reply(client, d, resolved),
				(error: unknown) => fail(client, d, error),
			);
		else reply(client, d, result);
	};
}
