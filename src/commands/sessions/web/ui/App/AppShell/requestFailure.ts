export async function requestFailure(
	res: Response | undefined,
): Promise<string> {
	if (!res) return "web server unreachable";
	try {
		const body = (await res.json()) as { error?: string };
		return body.error ?? `HTTP ${res.status}`;
	} catch {
		return `HTTP ${res.status}`;
	}
}
