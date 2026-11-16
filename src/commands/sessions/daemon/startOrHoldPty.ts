import type { Session } from "./types";

export function startOrHoldPty(
	start: () => Session["pty"],
	hold: boolean | undefined,
	driven?: () => boolean,
): Pick<Session, "pty" | "pendingStart" | "drivenStart"> {
	if (hold)
		return {
			pty: null,
			pendingStart: start,
			...(driven?.() && { drivenStart: true }),
		};
	return { pty: start() };
}
