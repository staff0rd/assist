import type { ClientFailure } from "../../../../../../shared/ClientFailure";

export function formatFailureBugPrompt(
	failure: ClientFailure,
	pageUrl: string,
	assistVersion: string,
): string {
	const lines = [
		"The assist web UI recorded this failure in its Recent failures panel:",
		"",
		`- Time: ${failure.at}`,
		`- Kind: ${failure.kind ?? "request"}`,
		`- Method: ${failure.method}`,
		`- Path: ${failure.path}`,
		`- Base: ${failure.base}`,
		`- Node: ${failure.node ?? "(local)"}`,
		`- Status: ${failure.status ?? "(none)"}`,
		`- Error: ${failure.error ?? "(none)"}`,
		`- Duration: ${failure.durationMs}ms`,
		`- Page URL: ${pageUrl}`,
		`- Assist version: ${assistVersion || "(unknown)"}`,
	];
	return lines.join("\n");
}
