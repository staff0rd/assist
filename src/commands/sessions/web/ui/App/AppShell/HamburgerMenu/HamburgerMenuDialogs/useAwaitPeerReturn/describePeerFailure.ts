type BrokenHop = { hop: string; error?: string; remediation?: string };

async function fetchBrokenHop(peer: string): Promise<BrokenHop | null> {
	try {
		const res = await fetch(
			`/api/node-doctor?link=${encodeURIComponent(peer)}`,
		);
		if (!res.ok) return null;
		return ((await res.json()) as { hop: BrokenHop | null }).hop;
	} catch {
		return null;
	}
}

export async function describePeerFailure(
	peer: string,
	summary: string,
): Promise<string> {
	const hop = await fetchBrokenHop(peer);
	if (!hop) return summary;
	const remediation = hop.remediation ? ` — ${hop.remediation}` : "";
	return `${summary}: ${hop.hop} hop failed: ${hop.error}${remediation}`;
}
