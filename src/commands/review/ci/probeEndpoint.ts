const TIMEOUT_MS = 60_000;
const MAX_BODY_CHARS = 300;

export async function probeEndpoint(
	url: string,
	headers: Record<string, string>,
	body: unknown,
): Promise<string | undefined> {
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json", ...headers },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		if (response.ok) return undefined;
		const text = (await response.text()).trim().slice(0, MAX_BODY_CHARS);
		return `HTTP ${response.status}${text ? `: ${text}` : ""}`;
	} catch (error) {
		if (!(error instanceof Error)) return String(error);
		const cause = error.cause instanceof Error ? error.cause.message : "";
		return cause ? `${error.message} (${cause})` : error.message;
	}
}
