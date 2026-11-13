import { pollBackoffDelay } from "./pollBackoffDelay";

type PollOutcome = { failed: boolean } | undefined;

export function startSerialPolling(
	run: (signal: AbortSignal) => Promise<PollOutcome>,
): { poll: () => void; stop: () => void } {
	const controller = new AbortController();
	let inFlight = false;
	let failures = 0;
	let timer: ReturnType<typeof setTimeout> | undefined;
	const poll = async () => {
		if (inFlight || controller.signal.aborted) return;
		inFlight = true;
		clearTimeout(timer);
		const outcome = await run(controller.signal);
		inFlight = false;
		if (controller.signal.aborted) return;
		failures = outcome?.failed ? failures + 1 : 0;
		timer = setTimeout(poll, pollBackoffDelay(failures));
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
