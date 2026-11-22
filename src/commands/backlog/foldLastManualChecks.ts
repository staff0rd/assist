type PhaseWithChecks = { manualChecks?: string[] };

export function foldLastManualChecks<P extends PhaseWithChecks>(
	phases: P[],
	reviewChecks: string[] = [],
): { phases: P[]; reviewChecks: string[] } {
	const last = phases.at(-1);
	if (!last?.manualChecks?.length) return { phases, reviewChecks };
	return {
		phases: [...phases.slice(0, -1), { ...last, manualChecks: undefined }],
		reviewChecks: [...reviewChecks, ...last.manualChecks],
	};
}
