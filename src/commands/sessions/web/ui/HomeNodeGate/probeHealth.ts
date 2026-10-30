export type NodeHealth = { nodeName?: string; version?: string };

export type ProbeResult =
	| { ok: true; health: NodeHealth }
	| { ok: false; error: string };

const TIMEOUT_MS = 5000;

export async function probeHealth(url: string): Promise<ProbeResult> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const res = await fetch(`${url}/api/health`, {
			signal: controller.signal,
			cache: "no-store",
		});
		if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
		return { ok: true, health: (await res.json()) as NodeHealth };
	} catch (error) {
		if (controller.signal.aborted)
			return { ok: false, error: `timed out after ${TIMEOUT_MS / 1000}s` };
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error),
		};
	} finally {
		clearTimeout(timer);
	}
}
