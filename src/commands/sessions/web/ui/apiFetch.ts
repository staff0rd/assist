import { apiUrl } from "./apiUrl";
import { markReported } from "./clientFailures/markReported";
import { requestFailureRecorder } from "./clientFailures/requestFailureRecorder";
import { timeoutSignal } from "./timeoutSignal";

const DEFAULT_TIMEOUT_MS = 30_000;

type ApiFetchInit = RequestInit & {
	timeoutMs?: number;
	capture?: boolean;
};

function isTimeout(reason: unknown): boolean {
	return reason instanceof DOMException && reason.name === "TimeoutError";
}

export async function apiFetch(
	path: string,
	init: ApiFetchInit = {},
): Promise<Response> {
	const {
		timeoutMs = DEFAULT_TIMEOUT_MS,
		capture = true,
		signal: callerSignal,
		...rest
	} = init;
	const { signal, clear } = timeoutSignal(callerSignal, timeoutMs);
	const record = requestFailureRecorder(path, rest.method, capture);
	try {
		const res = await fetch(apiUrl(path), { ...rest, signal });
		if (!res.ok)
			record({ status: res.status, error: res.statusText || undefined });
		return res;
	} catch (error) {
		const reason = signal.aborted ? signal.reason : error;
		if (!signal.aborted || isTimeout(reason)) {
			record({
				error: reason instanceof Error ? reason.message : String(reason),
			});
			markReported(reason);
		}
		throw reason;
	} finally {
		clear();
	}
}
