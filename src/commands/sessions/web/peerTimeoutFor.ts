import { peerTimeoutMs } from "./peerTimeoutMs";

const ASSIST_UPDATE_DURATION_MS = 600_000;

export function peerTimeoutFor(pathname: string): number {
	return pathname === "/api/self-update"
		? ASSIST_UPDATE_DURATION_MS
		: peerTimeoutMs;
}
