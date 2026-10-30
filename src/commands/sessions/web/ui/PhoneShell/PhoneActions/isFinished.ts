import type { SessionInfo } from "../../types";

export function isFinished({ status }: SessionInfo): boolean {
	return status === "done" || status === "stopped";
}
