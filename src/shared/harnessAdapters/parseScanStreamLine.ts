type ScanStreamEvent = {
	type?: unknown;
	subtype?: unknown;
	model?: unknown;
	tools?: unknown;
	mcp_servers?: unknown;
	message?: { id?: unknown; content?: unknown; usage?: unknown };
	total_cost_usd?: unknown;
	duration_ms?: unknown;
};

export function parseScanStreamLine(line: string): ScanStreamEvent | undefined {
	try {
		return JSON.parse(line) as ScanStreamEvent;
	} catch {
		return undefined;
	}
}
