import type { ItemStatusCounts } from "../../gitStatus";
import { apiFetch } from "../apiFetch";
import { reportCaughtError } from "../clientFailures/reportCaughtError";
import type { ProxyBlipGate } from "../createProxyBlipGate";

type Polled = { counts: ItemStatusCounts | null } | undefined;

export async function fetchGitStatusCounts(
	path: string,
	blipGate: ProxyBlipGate,
): Promise<Polled> {
	try {
		const res = await apiFetch(path, { blipGate });
		if (!res.ok) return { counts: null };
		return await res.json().then(
			(body: ItemStatusCounts | null) => ({ counts: body ?? null }),
			() => undefined,
		);
	} catch (error) {
		reportCaughtError(error, "git status counts");
		return { counts: null };
	}
}
