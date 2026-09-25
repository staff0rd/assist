export async function postJson(
	url: string,
	body: unknown,
	failureMessage: string,
): Promise<Record<string, unknown>> {
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const payload = await res.json().catch(() => ({}));
	if (!res.ok)
		throw new Error(
			typeof payload.error === "string" ? payload.error : failureMessage,
		);
	return payload;
}
