import type { ClientRequest, ServerResponse } from "node:http";
import { peerTimeoutMs } from "./peerTimeoutMs";

export function boundUpstream(
	upstream: ClientRequest,
	res: ServerResponse,
): void {
	upstream.setTimeout(peerTimeoutMs, () =>
		upstream.destroy(new Error(`no response after ${peerTimeoutMs}ms`)),
	);
	res.on("close", () => {
		if (!res.writableFinished) upstream.destroy();
	});
}
