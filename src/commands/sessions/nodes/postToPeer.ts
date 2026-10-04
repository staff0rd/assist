import { TRACE_HEADER } from "../shared/newTraceId";
import { resolveNodeName } from "../shared/resolveNodeName";

export async function postToPeer(
	baseUrl: string,
	path: string,
	traceId: string,
	timeoutMs: number,
): Promise<void> {
	const res = await fetch(new URL(path, baseUrl), {
		method: "POST",
		headers: {
			"x-assist-linked-from": resolveNodeName(),
			[TRACE_HEADER]: traceId,
		},
		signal: AbortSignal.timeout(timeoutMs),
	});
	if (res.ok) return;
	const body = (await res.json().catch(() => ({}))) as { error?: string };
	throw new Error(body.error ?? `POST ${path} returned ${res.status}`);
}
