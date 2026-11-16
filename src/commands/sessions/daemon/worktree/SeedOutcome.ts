export type InstallFailure = { path?: string; reason: string; output: string };

export type SeedOutcome = { ok: true } | ({ ok: false } & InstallFailure);

export type InstallOutcome =
	| { ok: true }
	| { ok: false; stopped: boolean; reason: string; output: string };
