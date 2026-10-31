import { recordClientFailure } from "../clientFailures/recordClientFailure";

export type NodeHealth = { nodeName?: string; version?: string };

export type ProbeResult =
	| { ok: true; health: NodeHealth }
	| { ok: false; error: string; status?: number };

const TIMEOUT_MS = 5000;
const HEALTH_PATH = "/api/health";

async function probe(url: string): Promise<ProbeResult> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const res = await fetch(`${url}${HEALTH_PATH}`, {
			signal: controller.signal,
			cache: "no-store",
		});
		if (!res.ok)
			return { ok: false, error: `HTTP ${res.status}`, status: res.status };
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

export async function probeHealth(url: string): Promise<ProbeResult> {
	const started = Date.now();
	const result = await probe(url);
	if (!result.ok)
		recordClientFailure({
			at: new Date(started).toISOString(),
			method: "GET",
			path: HEALTH_PATH,
			base: url,
			status: result.status,
			error: result.status === undefined ? result.error : undefined,
			durationMs: Date.now() - started,
		});
	return result;
}
