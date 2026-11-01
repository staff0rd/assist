import type { DisplayStatus } from "./displayStatus";

export function isAwaitingUser(status: DisplayStatus): boolean {
	return status === "waiting" || status === "question";
}
