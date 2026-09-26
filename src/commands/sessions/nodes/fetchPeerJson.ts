const PEER_TIMEOUT_MS = 3_000;

type PeerFetchError = Error & { code?: string; status?: number };

export function peerErrorCode(error: unknown): string | undefined {
	if (!(error instanceof Error)) return undefined;
	const { code, cause } = error as PeerFetchError & { cause?: unknown };
	if (code) return code;
	if (error.name === "TimeoutError") return "ETIMEDOUT";
	return cause instanceof Error ? peerErrorCode(cause) : undefined;
}

export function describePeerError(error: unknown): string {
	if (!(error instanceof Error)) return String(error);
	const cause = (error as { cause?: unknown }).cause;
	return cause instanceof Error
		? `${error.message}: ${describePeerError(cause)}`
		: error.message;
}

export async function fetchPeerJson<T>(
	baseUrl: string,
	path: string,
	timeoutMs = PEER_TIMEOUT_MS,
): Promise<T> {
	const res = await fetch(new URL(path, baseUrl), {
		signal: AbortSignal.timeout(timeoutMs),
	});
	if (!res.ok)
		throw Object.assign(
			new Error(`GET ${path} returned ${res.status} ${res.statusText}`),
			{ status: res.status },
		);
	return (await res.json()) as T;
}
