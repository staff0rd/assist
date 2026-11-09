import type { ConnectorRunResult } from "./types";

export function rejectConnectorRun(
	harness: string,
): () => Promise<ConnectorRunResult> {
	return () =>
		Promise.reject(
			new Error(`${harness} cannot run connector tools headlessly yet`),
		);
}
