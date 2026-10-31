import type { ClientFailure } from "../../../shared/ClientFailure";
import { apiUrl } from "../apiUrl";

const CLIENT_ERRORS_PATH = "/api/client-errors";

const FLUSH_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 60_000;
const REPORT_TIMEOUT_MS = 10_000;
const MAX_BATCH = 50;
const MAX_PENDING = 500;

let pending: ClientFailure[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let sending = false;
let retryDelayMs = FLUSH_DELAY_MS;

function schedule(delayMs: number): void {
	if (timer || sending) return;
	timer = setTimeout(() => {
		timer = undefined;
		void flush();
	}, delayMs);
}

async function sendWithoutCapture(batch: ClientFailure[]): Promise<boolean> {
	try {
		const res = await fetch(apiUrl(CLIENT_ERRORS_PATH), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ failures: batch }),
			signal: AbortSignal.timeout(REPORT_TIMEOUT_MS),
		});
		return res.ok;
	} catch {
		return false;
	}
}

async function flush(): Promise<void> {
	const batch = pending.slice(0, MAX_BATCH);
	if (batch.length === 0) return;
	sending = true;
	const delivered = await sendWithoutCapture(batch);
	sending = false;
	if (delivered) {
		pending = pending.slice(batch.length);
		retryDelayMs = FLUSH_DELAY_MS;
		if (pending.length > 0) schedule(0);
		return;
	}
	retryDelayMs = Math.min(retryDelayMs * 2, MAX_RETRY_DELAY_MS);
	schedule(retryDelayMs);
}

export function queueClientFailureReport(failure: ClientFailure): void {
	pending = [...pending, failure].slice(-MAX_PENDING);
	schedule(FLUSH_DELAY_MS);
}
