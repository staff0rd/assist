import type { ItemStatusCounts } from "../../gitStatus";
import { createProxyBlipGate } from "../createProxyBlipGate";
import { fetchGitStatusCounts } from "./fetchGitStatusCounts";
import { gitStatusPollDelay } from "./gitStatusPollDelay";

export function startGitStatusPolling(
	path: string,
	onCounts: (counts: ItemStatusCounts | null) => void,
): { poll: () => void; stop: () => void } {
	const controller = new AbortController();
	const blipGate = createProxyBlipGate();
	let inFlight = false;
	let failures = 0;
	let timer: ReturnType<typeof setTimeout> | undefined;
	const poll = async () => {
		if (inFlight || controller.signal.aborted) return;
		inFlight = true;
		clearTimeout(timer);
		const polled = await fetchGitStatusCounts(
			path,
			blipGate,
			controller.signal,
		);
		inFlight = false;
		if (controller.signal.aborted) return;
		failures = polled?.failed ? failures + 1 : 0;
		if (polled) onCounts(polled.counts);
		timer = setTimeout(poll, gitStatusPollDelay(failures));
	};
	poll();
	return {
		poll,
		stop: () => {
			controller.abort();
			clearTimeout(timer);
		},
	};
}
