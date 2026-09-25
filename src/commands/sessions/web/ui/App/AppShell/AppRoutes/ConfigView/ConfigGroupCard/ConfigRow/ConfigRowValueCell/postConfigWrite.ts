export async function postConfigWrite(
	path: string,
	body: unknown,
	failureMessage: string,
): Promise<{ error?: string; payload?: Record<string, unknown> }> {
	try {
		const res = await fetch(path, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const parsed = await res.json().catch(() => null);
		if (!res.ok) return { error: parsed?.error ?? `HTTP ${res.status}` };
		return { payload: parsed ?? undefined };
	} catch {
		return { error: failureMessage };
	}
}
