export type ScanStreamEvent = {
	type?: unknown;
	model?: unknown;
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
