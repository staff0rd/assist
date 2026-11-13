import { sendTo } from "./broadcast";
import { type Handler, routed } from "./routed";

export const retryHandlers: Record<string, Handler> = {
	retry: routed((client, m, d) => {
		const conflict = m.retrySession(d.sessionId as string, d.replace === true);
		if (conflict)
			sendTo(client, {
				type: "run-conflict",
				sessionId: d.sessionId,
				existing: conflict,
			});
	}),
	"start-over": routed((client, m, d) => {
		const result = m.restart(d.sessionId as string, true);
		if (!result.ok && result.reason)
			sendTo(client, { type: "error", message: result.reason });
	}),
	restart: routed((client, m, d) => {
		const result = m.restart(d.sessionId as string);
		if (!result.ok && result.reason)
			sendTo(client, { type: "error", message: result.reason });
	}),
};
