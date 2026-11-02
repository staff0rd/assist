import type { SessionClient } from "../broadcast";
import type { TransferDeps } from "./TransferDeps";

type Msg = Record<string, unknown>;
type Router = Pick<TransferDeps["links"], "route">;

export type LaunchOutcome =
	| { ok: true; sessionId: string }
	| { ok: false; error: string };

export function launchOnTarget(
	links: Router,
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
		try {
			if (!links.route(capture, request))
				resolve({ ok: false, error: `${request.node} is not a linked node` });
		} catch (error) {
			resolve({
				ok: false,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	});
}
