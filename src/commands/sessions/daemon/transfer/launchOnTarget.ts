import type { SessionClient } from "../broadcast";

type Msg = Record<string, unknown>;
type Route = (client: SessionClient, data: Msg) => boolean;

export type LaunchOutcome =
	| { ok: true; sessionId: string }
	| { ok: false; error: string };

export function launchOnTarget(
	route: Route,
	request: Msg,
): Promise<LaunchOutcome> {
	return new Promise((resolve) => {
		const capture: SessionClient = {
			send: (raw) => {
				const msg = JSON.parse(raw) as Msg;
				if (msg.type === "created")
					resolve({ ok: true, sessionId: msg.sessionId as string });
				else if (msg.type === "error")
					resolve({ ok: false, error: String(msg.message) });
			},
		};
		if (!route(capture, request))
			resolve({ ok: false, error: `${request.node} is not a linked node` });
	});
}
