/** An item's phase progress: phases below currentPhase are done, plus the explicit per-phase run states (0-based idx). */
export type PhaseProgress = {
	currentPhase: number | undefined;
	running: number[];
	done: number[];
	failed: number[];
};
