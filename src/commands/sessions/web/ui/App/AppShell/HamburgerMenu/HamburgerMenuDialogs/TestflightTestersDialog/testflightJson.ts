import { apiFetch } from "../../../../../apiFetch";

export async function testflightJson<T>(init: RequestInit = {}): Promise<T> {
	const res = await apiFetch("/api/testflight/testers", {
		...init,
		capture: false,
		timeoutMs: 60_000,
	});
	const body = await res.json();
	if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
	return body;
}
