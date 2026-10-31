export type ClientFailure = {
	at: string;
	kind?: "error" | "rejection";
	method: string;
	path: string;
	base: string;
	node?: string;
	status?: number;
	error?: string;
	durationMs: number;
};
