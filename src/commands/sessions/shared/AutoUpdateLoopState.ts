export type AutoUpdatePhase = "off" | "waiting" | "diverged" | "retrying";

export type AutoUpdateLoopState = {
	phase: AutoUpdatePhase;
	since: string;
	reason?: string;
	escalationId?: string;
};

export type AutoUpdateReply = {
	type: "auto-update";
	version: string;
	startCommit?: string;
	loop: AutoUpdateLoopState;
};
