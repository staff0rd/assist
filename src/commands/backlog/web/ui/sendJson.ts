import { apiFetch } from "../../../sessions/web/ui/apiFetch";

export async function sendJson<T>(
	url: string,
	method: string,
	body: unknown,
): Promise<T> {
	const res = await apiFetch(url, {
		method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(`${method} ${url} failed: ${res.status}`);
	return res.json();
}
