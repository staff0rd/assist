import type { ItemStatusCounts } from "../../gitStatus";
import { createProxyBlipGate } from "../createProxyBlipGate";
import { startSerialPolling } from "../startSerialPolling";
import { fetchGitStatusCounts } from "./fetchGitStatusCounts";

export function startGitStatusPolling(
	path: string,
	onCounts: (counts: ItemStatusCounts | null) => void,
): { poll: () => void; stop: () => void } {
	const blipGate = createProxyBlipGate();
	return startSerialPolling(async (signal) => {
		const polled = await fetchGitStatusCounts(path, blipGate, signal);
		if (polled) onCounts(polled.counts);
		return polled && { failed: !!polled.failed };
	});
}
