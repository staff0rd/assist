import type { ClientRequest, ServerResponse } from "node:http";

export function boundUpstream(
	upstream: ClientRequest,
	res: ServerResponse,
	timeoutMs: number,
): void {
	upstream.setTimeout(timeoutMs, () =>
		upstream.destroy(new Error(`no response after ${timeoutMs}ms`)),
	);
	res.on("close", () => {
		if (!res.writableFinished) upstream.destroy();
	});
}
