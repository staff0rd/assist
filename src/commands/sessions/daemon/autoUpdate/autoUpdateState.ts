import type {
	AutoUpdateLoopState,
	AutoUpdatePhase,
} from "../../shared/AutoUpdateLoopState";

let loop: AutoUpdateLoopState = {
	phase: "off",
	since: new Date().toISOString(),
	reason: "not started",
};
let startCommit: string | undefined;

export const autoUpdateState = {
	loop: (): AutoUpdateLoopState => loop,
	startCommit: (): string | undefined => startCommit,
	setStartCommit: (commit: string | undefined): void => {
		startCommit = commit;
	},
	enter: (
		phase: AutoUpdatePhase,
		extra: { reason?: string; escalationId?: string } = {},
	): void => {
		loop = { phase, since: new Date().toISOString(), ...extra };
	},
};
