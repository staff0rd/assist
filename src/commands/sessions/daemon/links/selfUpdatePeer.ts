const SELF_UPDATE_TIMEOUT_MS = 10 * 60_000;

export async function selfUpdatePeer(url: string): Promise<void> {
	const response = await fetch(new URL("/api/self-update", url), {
		method: "POST",
		signal: AbortSignal.timeout(SELF_UPDATE_TIMEOUT_MS),
	});
	if (response.ok) return;
	const body = (await response.json().catch(() => ({}))) as { error?: string };
	throw new Error(body.error ?? `self-update responded ${response.status}`);
}
