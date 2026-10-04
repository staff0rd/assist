import { appendDaemonLog } from "../daemon/appendDaemonLog";
import type { LinkSpec, LinkStatus } from "../daemon/links/LinkStatus";
import { findLinkSpec } from "../shared/loadLinkSpecs";
import { newTraceId } from "../shared/newTraceId";
import { awaitLinkReturn } from "./awaitLinkReturn";
import { describePeerError } from "./fetchPeerJson";
import { firstBrokenHop } from "./firstBrokenHop";

const RETURN_TIMEOUT_MS = 90_000;

export type PeerAction = {
	spec: LinkSpec;
	traceId: string;
	fail(summary: string, error?: unknown): Promise<Error>;
	awaitReturn(sawDown: boolean, timeoutMs?: number): Promise<LinkStatus>;
};

async function describeFailure(
	name: string,
	summary: string,
	error?: unknown,
): Promise<string> {
	const cause = error === undefined ? "" : ` (${describePeerError(error)})`;
	const hop = await firstBrokenHop(name);
	if (!hop) return `${summary}${cause}`;
	const remediation = hop.remediation ? ` — ${hop.remediation}` : "";
	return `${summary}${cause}: ${hop.hop} hop failed: ${hop.error}${remediation}`;
}

export function startPeerAction(name: string, action: string): PeerAction {
	const spec = findLinkSpec(name);
	if (!spec)
		throw new Error(`No link named ${name}; see assist sessions nodes`);
	const traceId = newTraceId();
	const line = `nodes ${action} ${name} trace=${traceId}`;
	console.log(line);
	appendDaemonLog(line);
	const fail = async (summary: string, error?: unknown) =>
		new Error(await describeFailure(name, summary, error));
	return {
		spec,
		traceId,
		fail,
		async awaitReturn(sawDown, timeoutMs = RETURN_TIMEOUT_MS) {
			const link = await awaitLinkReturn(name, { sawDown, timeoutMs });
			if (!link) throw await fail(`${name} did not come back`);
			return link;
		},
	};
}
