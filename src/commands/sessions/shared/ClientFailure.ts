export type ClientFailure = {
	at: string;
	method: string;
	path: string;
	base: string;
	node?: string;
	status?: number;
	error?: string;
	durationMs: number;
};
