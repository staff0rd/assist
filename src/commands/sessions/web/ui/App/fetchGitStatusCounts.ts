import type { ItemStatusCounts } from "../../gitStatus";
import { apiFetch } from "../apiFetch";
import { reportCaughtError } from "../clientFailures/reportCaughtError";
import type { ProxyBlipGate } from "../createProxyBlipGate";

type Polled = { counts: ItemStatusCounts | null; failed?: boolean } | undefined;

export async function fetchGitStatusCounts(
	path: string,
	blipGate: ProxyBlipGate,
	signal?: AbortSignal,
): Promise<Polled> {
	try {
		const res = await apiFetch(path, { blipGate, signal });
		if (!res.ok) return { counts: null, failed: true };
		return await res.json().then(
			(body: ItemStatusCounts | null) => ({ counts: body ?? null }),
			() => undefined,
		);
	} catch (error) {
		if (signal?.aborted) return undefined;
		reportCaughtError(error, "git status counts");
		return { counts: null, failed: true };
	}
}
